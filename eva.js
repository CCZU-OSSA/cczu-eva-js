// ==UserScript==
// @name         吊大 一键教学评价 (可能优化版)
// @namespace    http://tampermonkey.net/
// @version      2025-09-17
// @description  吊大 ┗|｀O′|┛ 嗷~~ 哦哦噢噢噢哦哦喔喔喔喔奥奥奥奥！！要去了！！
// @author       lliiooll (重构 by Roo)
// @match        http://202.195.102.53/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=102.53
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- 用户配置 ---
    const config = {
        // 总体评价内容, 可选: '很好', '较好', '一般', '较差'
        evaluationText: '很好',
        // 各项评分, 可选: '100', '80', '60', '0'
        itemScore: '100',
        // 教学意见与建议内容
        suggestionText: '老师讲得很好，没有意见。',
        // 完成所有评价后的提示信息
        completionMessage: '所有课程评价完毕！',
        // 评价完成后刷新页面的延迟时间 (毫秒)
        refreshDelay: 1000,
    };

    /**
     * @description 课程选择页面处理逻辑
     */
    function handleCourseSelectionPage() {
        const courses = document.querySelectorAll('.dg1-item');
        if (courses.length === 0) {
            console.log('未找到课程列表。');
            return;
        }

        let currentIndex = parseInt(sessionStorage.getItem('evaluationIndex') || '0', 10);

        if (currentIndex < courses.length) {
            console.log(`正在评价第 ${currentIndex + 1} / ${courses.length} 门课程...`);
            // 使用 __doPostBack 跳转到评价页面
            __doPostBack('GVpjkc', 'Select$' + currentIndex);
            sessionStorage.setItem('evaluationIndex', currentIndex + 1);
        } else {
            console.log(config.completionMessage);
            alert(config.completionMessage);
            sessionStorage.removeItem('evaluationIndex');
        }
    }

    /**
     * @description 课程评价页面处理逻辑
     */
    function handleCourseEvaluationPage() {
        // 1. 填写总体评价
        const evaluationSelect = document.getElementById('DDztpj');
        if (evaluationSelect) {
            evaluationSelect.value = config.evaluationText;
        }

        // 2. 填写各项评分
        // 通过更稳定的选择器找到所有评分单选框
        const scoreRadios = document.querySelectorAll(`input[type="radio"][value="${config.itemScore}"]`);
        scoreRadios.forEach(radio => {
            // 确保只选中属于评分表的单选框
            if (radio.id.includes('GVpjzb_')) {
                radio.checked = true;
            }
        });

        // 3. 填写意见和建议
        const suggestionTextarea = document.getElementById('Txtyjjy');
        if (suggestionTextarea) {
            suggestionTextarea.value = config.suggestionText;
        }

        // 4. 屏蔽确认弹窗，防止中断自动提交流程
        window.alert = () => true;
        window.confirm = () => true;

        // 5. 触发保存按钮
        const saveButton = document.getElementById('Button2');
        if (saveButton) {
            saveButton.click();
        }
    }

    /**
     * @description 主框架页面处理逻辑，用于接收子页面消息并刷新
     */
    function setupFrameListener() {
        window.addEventListener('message', (event) => {
            // 简单的安全校验，确保消息来源可靠
            if (event.origin !== window.location.origin) {
                return;
            }
            if (event.data === 'evaluation_completed') {
                console.log('收到子页面评价完成消息，准备刷新...');
                setTimeout(() => {
                    const refreshButton = document.getElementById('btsximg');
                    if (refreshButton) {
                        refreshButton.click();
                    }
                }, config.refreshDelay);
            }
        });
    }

    /**
     * @description 脚本入口函数
     */
    function main() {
        const path = window.location.pathname;

        if (path.endsWith('jxpj_xspj_kcxz.aspx')) {
            // 课程选择页
            handleCourseSelectionPage();
        } else if (path.endsWith('jxpj_xspj_kcpj.aspx')) {
            // 课程评价页 (在 iframe 中)
            handleCourseEvaluationPage();
            // 通知父页面刷新
            window.parent.postMessage('evaluation_completed', window.location.origin);
        } else {
            // 其他页面
            setupFrameListener();
        }
    }

    // 执行脚本
    main();

})();
