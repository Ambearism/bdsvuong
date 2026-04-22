declare module 'jstree'
declare module 'jstree/dist/themes/default/style.css'

declare global {
    interface JQuery {
        jstree(...args: unknown[]): unknown
    }
}
export {}
