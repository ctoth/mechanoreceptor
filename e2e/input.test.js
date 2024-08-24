var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { test, expect } from "@playwright/test";
const TEST_HTML_URL = "http://localhost:8080/public/test.html";
test.describe("Input tests", () => {
    test.beforeEach(({ page }) => __awaiter(void 0, void 0, void 0, function* () {
        const logs = [];
        page.on("console", (msg) => {
            console.log("Browser console:", msg.text());
            logs.push(msg.text());
        });
        page.on("pageerror", (err) => console.error("Browser page error:", err));
        yield page.goto(TEST_HTML_URL);
        yield page.waitForLoadState("domcontentloaded");
        yield test.step("Wait for Mechanoreceptor to load", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield page.waitForFunction(() => window.mechanoreceptorReady === true || window.mechanoreceptorError, { timeout: 5000 });
                const error = yield page.evaluate(() => window.mechanoreceptorError);
                if (error) {
                    throw new Error(`Mechanoreceptor failed to initialize: ${error}`);
                }
            }
            catch (error) {
                console.error("Timeout waiting for Mechanoreceptor to be ready");
                console.log("Captured logs:", logs.join("\n"));
                yield test.step("Debug information", () => __awaiter(void 0, void 0, void 0, function* () {
                    console.log("Page content:", yield page.content());
                    console.log("Window object:", yield page.evaluate(() => Object.keys(window)));
                    console.log("Mechanoreceptor object:", yield page.evaluate(() => window.Mechanoreceptor));
                    console.log("Script errors:", yield page.evaluate(() => window.scriptErrors));
                }));
                throw error;
            }
        }));
    }));
    test("Keyboard input test", ({ page }) => __awaiter(void 0, void 0, void 0, function* () {
        yield test.step("Check if script is loaded", () => __awaiter(void 0, void 0, void 0, function* () {
            const scriptLoaded = yield page.evaluate(() => typeof window.Mechanoreceptor !== "undefined");
            expect(scriptLoaded).toBe(true);
        }));
        yield test.step("Simulate key press", () => __awaiter(void 0, void 0, void 0, function* () {
            yield page.keyboard.press("A");
        }));
        yield test.step("Verify key press", () => __awaiter(void 0, void 0, void 0, function* () {
            const keyStatus = yield page.evaluate(() => window.lastKeyPressed);
            expect(keyStatus).toBe("KeyA");
        }));
    }));
    test("Mouse input test", ({ page }) => __awaiter(void 0, void 0, void 0, function* () {
        yield test.step("Simulate mouse click", () => __awaiter(void 0, void 0, void 0, function* () {
            yield page.mouse.click(100, 100);
        }));
        yield test.step("Verify mouse click", () => __awaiter(void 0, void 0, void 0, function* () {
            const clickStatus = yield page.evaluate(() => window.lastMouseClick);
            expect(clickStatus).toEqual({ x: 100, y: 100 });
        }));
    }));
});
