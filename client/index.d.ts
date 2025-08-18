declare module "*.module.css";

declare module "*.png";
declare module "*.svg";
declare module "*.webp";

declare interface ImportMeta {
    readonly env: Record<string, string>;
}