import { cn } from "@/lib/utils/cn";

describe("cn helper", () => {
  test("combina classes condicionais corretamente", () => {
    // ARRANGE
    const base = "btn";
    const conditional = false;

    // ACT
    const result = cn(base, { "btn-primary": true, hidden: conditional });

    // ASSERT
    expect(result).toBe("btn btn-primary");
  });

  test("remove classes duplicadas ao mesclar", () => {
    // ARRANGE
    const className = "text-sm text-sm font-bold";

    // ACT
    const result = cn("text-base", className);

    // ASSERT
    expect(result).toBe("text-sm font-bold");
  });
});

