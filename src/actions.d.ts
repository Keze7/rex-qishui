/// <reference types='@rexnow/libs/env' />

// 条目菜单操作回调（由 WidgetMetadata 里的 actions.functionName 引用），
// rex-widget-env.d.ts 是构建自动生成的，手写的声明放这里才不会被覆盖。
declare let logoutAccount: (
  params: QishuiMusic.GlobalParams & WidgetItemActionParams,
) => WidgetActionResult | Promise<WidgetActionResult>;
