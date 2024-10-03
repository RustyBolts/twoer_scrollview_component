import { _decorator, sys } from 'cc';
const { ccclass } = _decorator;

@ccclass('StorageTool')
export class StorageTool {

    // 靜態參數：基礎路徑，可以根據需要修改
    private static readonly BASE_PATH: string = 'assets/resources/save/';

    /**
     * 將資料保存到指定的文件中
     * @param filename 文件名稱（包括副檔名，例如：data.json）
     * @param data 要保存的資料，應為 JSON 格式
     */
    public static saveToFile(filename: string, data: any): void {
        const path = `${this.BASE_PATH}${filename}`;
        const jsonString = JSON.stringify(data, null, 2);

        // 使用 sys.localStorage 或 cc.sys 下的其他 API 來進行文件操作
        sys.localStorage.setItem(path, jsonString);
    }

    /**
     * 從指定的文件中讀取資料
     * @param filename 文件名稱（包括副檔名，例如：data.json）
     * @returns 讀取到的資料，會被解析為 JSON 格式
     */
    public static loadFromFile(filename: string): any {
        const path = `${this.BASE_PATH}${filename}`;
        const jsonString = sys.localStorage.getItem(path);

        if (jsonString) {
            return JSON.parse(jsonString);
        } else {
            console.warn(`文件未找到: ${path}`);
            return null;
        }
    }

    /**
     * 刪除指定的文件
     * @param filename 文件名稱（包括副檔名，例如：data.json）
     */
    public static deleteFile(filename: string): void {
        const path = `${this.BASE_PATH}${filename}`;
        sys.localStorage.removeItem(path);
        console.log(`文件已刪除: ${path}`);
    }

    public static listFiles(): string[] {
        const prefix = `${this.BASE_PATH}`;
        const keys = Object.keys(sys.localStorage);
        const result = [];
        for (const key of keys) {
            if (key.startsWith(prefix)) {
                result.push(key.slice(prefix.length));
            }
        }
        // console.log(Object.values(sys.localStorage));

        return result;
    }
}
