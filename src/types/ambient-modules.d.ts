declare module "hls.js" {
  export default class Hls {
    static isSupported(): boolean;
    static Events: Record<string, string>;
    constructor(config?: Record<string, unknown>);
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    destroy(): void;
  }
}

declare module "lru-cache" {
  export class LRUCache<K, V> {
    constructor(options?: {
      max?: number;
      ttl?: number;
    });
    get(key: K): V | undefined;
    set(key: K, value: V): void;
  }
}
