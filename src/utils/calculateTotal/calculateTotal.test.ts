import { describe, it, expect } from "vitest";
import { calculateTotal } from "./calculateTotal"; // Adjust the import path as needed

describe("calculateTotal", () => {
  // Test 1: Basic functionality
  it("should return correct sum for comma-separated values", () => {
    expect(calculateTotal("1,2,3")).toBe(6);
    expect(calculateTotal("10.5,20.3,30.2")).toBe(61);
    expect(calculateTotal("0.1,0.2,0.3")).toBeCloseTo(0.6);
  });

  // Test 2: Newline-separated values
  it("should handle newline-separated values", () => {
    expect(calculateTotal("1\n2\n3")).toBe(6);
    expect(calculateTotal("10\n20\n30")).toBe(60);
  });

  // Test 3: Mixed separators (comma and newline)
  it("should handle mixed comma and newline separators", () => {
    expect(calculateTotal("1,2\n3")).toBe(6);
    expect(calculateTotal("1\n2,3\n4")).toBe(10);
    expect(calculateTotal("1.5\n2.5,3.5\n4.5")).toBe(12);
  });

  // Test 4: Empty and whitespace handling
  it("should handle empty strings and whitespace", () => {
    expect(calculateTotal("")).toBe(0);
    expect(calculateTotal("   ")).toBe(0);
    expect(calculateTotal("1, ,3")).toBe(4);
    expect(calculateTotal("1\n\n3")).toBe(4);
  });

  // Test 5: Leading/trailing spaces
  it("should trim whitespace around values", () => {
    expect(calculateTotal(" 1 , 2 , 3 ")).toBe(6);
    expect(calculateTotal("  10.5  ,  20.5  ")).toBe(31);
    expect(calculateTotal("  \n 1 \n 2 \n 3 \n ")).toBe(6);
  });

  // Test 6: Single value
  it("should handle single values", () => {
    expect(calculateTotal("5")).toBe(5);
    expect(calculateTotal("10.5")).toBe(10.5);
    expect(calculateTotal(" 100 ")).toBe(100);
  });

  // Test 7: Invalid input returns 0
  it("should return 0 when input contains non-numeric values", () => {
    expect(calculateTotal("1,a,3")).toBe(0);
    expect(calculateTotal("hello")).toBe(0);
    expect(calculateTotal("1,2,three")).toBe(0);
    //expect(calculateTotal("1.2.3,4")).toBe(0); // Invalid number format
    //expect(calculateTotal("1,2,3abc")).toBe(0);
  });

  // Test 8: Edge cases with decimal numbers
  it("should handle decimal numbers correctly", () => {
    expect(calculateTotal("0.1,0.2")).toBeCloseTo(0.3);
    expect(calculateTotal("1.111,2.222")).toBeCloseTo(3.333);
    expect(calculateTotal("0.0,0.00,0.000")).toBe(0);
  });

  // Test 9: Negative numbers
  it("should handle negative numbers", () => {
    expect(calculateTotal("-1,2,-3")).toBe(-2);
    expect(calculateTotal("10,-5")).toBe(5);
    expect(calculateTotal("-10.5,-20.5")).toBe(-31);
  });

  // Test 10: Large numbers
  it("should handle large numbers", () => {
    expect(calculateTotal("1000000,2000000")).toBe(3000000);
    expect(calculateTotal("999999.99,0.01")).toBe(1000000);
  });

  // Test 11: Mixed valid and invalid - should return 0
  it("should return 0 if ANY value is invalid", () => {
    expect(calculateTotal("1,2,invalid")).toBe(0);
    expect(calculateTotal("valid,2,3")).toBe(0);
    expect(calculateTotal("1,2,3,")).toBe(6); // Trailing comma with empty value
    expect(calculateTotal(",1,2,3")).toBe(6); // Leading comma with empty value
  });

  // Test 12: Real-world examples (like airdrop amounts)
  it("should handle real-world airdrop amount lists", () => {
    const airdropList = `1000
    2000
    3000
    1500
    2500`;
    expect(calculateTotal(airdropList)).toBe(10000);

    const csvList = "1000,2000,3000,1500,2500";
    expect(calculateTotal(csvList)).toBe(10000);
  });
});
