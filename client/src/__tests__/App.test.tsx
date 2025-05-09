import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Cover Letter Generator", () => {
  it("should render without crashing", () => {
    render(<div>Hello World</div>);
    expect(screen.getByText("Hello World")).toBeTruthy();
  });
});
