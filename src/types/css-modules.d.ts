declare module '*.module.scss' {
    const scssContent: Record<string, string>;
    export default scssContent;
}

declare module '*.css' {
    const cssContent: Record<string, string>;
    export default cssContent;
}
