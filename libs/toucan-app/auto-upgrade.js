//
// 自动更新
//
const { ToucanRunner } = require('../toucan-service');
const { gitPull, gitState, isWindowPlatform } = require('../toucan-utility');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

class ToucanUpgrade extends ToucanRunner {

    constructor() {
        super();
        // 默认的自动更新计划 - 每小时检查更新一次
        // 使用随机分钟，保证多个机器不在同一时间访问服务器
        this.defaultscheduleRule = `${_.random(0, 59)} * * * *`;
        // 显示下次计划时间
        this.showNextSchedule = {
            enable: true,
            title: '下次检查更新时间：'
        }

        // 重新启动的监听者
        this.restartListener = [];
    }

    // 每次的工作计划
    async scheduleWork({ workDir = process.cwd() } = {}) {

        this.log(`准备从代码库拉取更新 -> 本地工作目录：${workDir}`);
        const gitResult = gitPull({ workDir }) || {};

        // 记录服务器的响应
        this.log('代码库应答：\n', gitResult.response);

        if (gitResult.state === gitState.updateDone) {
            // 如果发现更新
            this.log('代码更新成功，准备更新npm依赖...');
            const npmResult = execFileSync(buildExecFileWithPlatfomr('cnpm'), ['install'], { cwd: workDir }).toString();

            // 把git的响应和npm的结果写入升级日志中
            writeUpgradeLog(workDir, gitResult.response, npmResult);
            this.log('安装依赖成功，准备重启服务...');

            // 发送重启的通知
            await this.triggleRestartListener();

        } else {
            this.log('当前代码为最新版本');
        }

    }

    // 添加监听消息的人
    addRestartListener(callbk) {
        if (_.isFunction(callbk)) this.restartListener.push(callbk);
    }

    // 触发重新启动的监听
    async triggleRestartListener() {
        for await (const f of this.restartListener) {
            try {
                await f();
            }
            catch (error) {
                this.error('触发监听事件发生异常', error);
            }
        }
    }
}

function writeUpgradeLog(workDir, gitResponse, npmResult) {
    const dir = path.resolve(workDir, 'upgrade');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = path.resolve(dir, `${_.now()}.txt`);
    fs.writeFileSync(file, `${gitResponse}\r\n\r\n${npmResult}`);
}

// 根据平台构建知悉的命令
// 在window平台上，需要加.cmd
function buildExecFileWithPlatfomr(cmd) {
    if (isWindowPlatform()) return `${cmd}.cmd`;
    return cmd;
}

module.exports = new ToucanUpgrade();