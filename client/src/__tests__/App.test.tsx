import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// mock 掉副作用
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("./assets/images/doc.png", () => ({
  default: "mock-doc.png",
}));

describe("Cover Letter Generator - form validation", () => {
  it("should show error messages if JD and CV are missing", async () => {
    const { default: App } = await import("../App");
    render(<App />);

    // 找到 form 中的按鈕
    const button = screen.getByRole("button", { name: /generate/i });

    // 點下按鈕
    fireEvent.click(button);

    // 驗證錯誤訊息是否出現
    expect(screen.getByText(/please paste job description/i)).toBeTruthy();
    expect(screen.getByText(/please upload your resume/i)).toBeTruthy();
  });
});
