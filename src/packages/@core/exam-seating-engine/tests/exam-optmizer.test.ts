import { describe, it, expect, beforeEach } from "vitest";
import { ExamOptimizer } from "../index";
import type { Student, Room } from "../index";

describe("ExamOptimizer", () => {
  let optimizer: ExamOptimizer;
  let mockStudents: Student[];
  let mockRooms: Room[];

  beforeEach(() => {
    optimizer = new ExamOptimizer(0.8);

    mockStudents = [
      { id: "1", name: "Alice", classId: "MATH101" },
      { id: "2", name: "Bob", classId: "MATH101" },
      { id: "3", name: "Charlie", classId: "PHY101" },
      { id: "4", name: "Diana", classId: "PHY101" },
    ];

    mockRooms = [
      { id: "R1", name: "Main Hall", maxCapacity: 10 },
      { id: "R2", name: "Lab A", maxCapacity: 2 },
    ];
  });

  it("should correctly allocate students without overloading", () => {
    const reports = optimizer.generateSeatingPlan(mockStudents, mockRooms, 2);

    expect(reports.length).toBeGreaterThan(0);

    const totalAllocated = reports.reduce((sum, r) => sum + r.studentCount, 0);
    expect(totalAllocated).toBe(mockStudents.length);

    // Ensure no room is falsely flagged as overloaded
    reports.forEach((report) => {
      expect(report.isOverloaded).toBe(false);
      expect(report.occupancyRate).toBeLessThanOrEqual(1);
    });
  });

  it("should throw an error if total room capacity is insufficient", () => {
    const tinyRooms: Room[] = [{ id: "R3", name: "Closet", maxCapacity: 1 }];

    expect(() => {
      optimizer.generateSeatingPlan(mockStudents, tinyRooms, 2);
    }).toThrow("Insufficient capacity");
  });

  it("should separate students from the same class", () => {
    const reports = optimizer.generateSeatingPlan(mockStudents, mockRooms, 2);
    const plan = reports[0].seatingPlan; // Assuming all go to Main Hall

    if (plan.length >= 2) {
      // Because of round-robin, adjacent students (index 0 and 1) should have different classes
      expect(plan[0].student.classId).not.toEqual(plan[1].student.classId);
    }
  });
});
