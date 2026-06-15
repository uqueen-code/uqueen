/**
 * i18n 已彻底废弃 — 全站硬编码中文
 *
 * 原先的 i18next/react-i18next 是导致白屏和死锁的元凶：
 * - 异步加载语言包导致 hydration 不一致
 * - 网络延迟时 t() 返回 key 字符串，触发 useEffect 无限重渲染
 * - 组件 mount 时 i18n 尚未就绪，状态竞态导致主线程冻结
 *
 * 现在所有文案直接硬编码在组件中，不再依赖任何翻译框架。
 * 本文件仅保留空操作导出，防止其他模块的 import 报错。
 */

/**
 * 语言切换 — 空操作，强制锁定中文
 */
export function changeLanguage(_lang: string): void {
  // 不再切换语言，强制锁定中文
}

/**
 * 获取当前语言 — 固定返回中文
 */
export function getCurrentLanguage(): string {
  return 'zh-CN';
}

// 默认导出空对象，防止 import default 报错
const _noop = {};
export default _noop;
