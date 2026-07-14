import { eq, and, or, sql, desc, lt, gt, isNull, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { users, units, residentProfiles, complaints, serviceRequests, maintenanceBills, announcements } from "../db/schema";
import { AppError } from "../middlewares/errorHandler";

export class DashboardService {
  // GET /api/dashboard/admin
  public static async getAdminDashboard(): Promise<any> {
    // 1. Occupancy summary
    const [totalRes] = await db.select({ count: sql<number>`count(*)` }).from(units);
    const [occupiedRes] = await db.select({ count: sql<number>`count(*)` }).from(units).where(eq(units.status, "occupied"));
    const [vacantRes] = await db.select({ count: sql<number>`count(*)` }).from(units).where(eq(units.status, "vacant"));

    const totalUnits = Number(totalRes?.count || 0);
    const occupied = Number(occupiedRes?.count || 0);
    const vacant = Number(vacantRes?.count || 0);

    // 2. Finances (latest period calculations)
    const latestPeriodRecord = await db
      .select({ billingPeriod: maintenanceBills.billingPeriod })
      .from(maintenanceBills)
      .orderBy(desc(maintenanceBills.createdAt))
      .limit(1);

    let finances = {
      billingPeriod: "",
      totalBilled: "0.00",
      totalCollected: "0.00",
      collectionRatePercent: 0.0,
    };

    if (latestPeriodRecord.length > 0) {
      const activePeriod = latestPeriodRecord[0].billingPeriod;

      const [billedSum] = await db
        .select({ sum: sql<string>`sum(total_amount)` })
        .from(maintenanceBills)
        .where(eq(maintenanceBills.billingPeriod, activePeriod));

      const [collectedSum] = await db
        .select({ sum: sql<string>`sum(total_amount)` })
        .from(maintenanceBills)
        .where(
          and(
            eq(maintenanceBills.billingPeriod, activePeriod),
            eq(maintenanceBills.status, "paid")
          )
        );

      const totalBilledVal = Number(billedSum?.sum || 0);
      const totalCollectedVal = Number(collectedSum?.sum || 0);
      const collectionRatePercent =
        totalBilledVal > 0 ? Math.round((totalCollectedVal / totalBilledVal) * 100 * 10) / 10 : 0.0;

      finances = {
        billingPeriod: activePeriod,
        totalBilled: totalBilledVal.toFixed(2),
        totalCollected: totalCollectedVal.toFixed(2),
        collectionRatePercent,
      };
    }

    // 3. Ticket Counters
    const [pendingComplaintsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.status, "pending"));

    const [assignedComplaintsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.status, "assigned"));

    const [pendingServiceRequestsRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequests)
      .where(eq(serviceRequests.status, "pending"));

    const tickets = {
      pendingComplaints: Number(pendingComplaintsRes?.count || 0),
      assignedComplaints: Number(assignedComplaintsRes?.count || 0),
      pendingServiceRequests: Number(pendingServiceRequestsRes?.count || 0),
    };

    return {
      occupancy: { totalUnits, occupied, vacant },
      finances,
      tickets,
    };
  }

  // GET /api/dashboard/resident
  public static async getResidentDashboard(residentId: string): Promise<any> {
    // 1. Resolve unitId
    const profileRecords = await db
      .select()
      .from(residentProfiles)
      .where(eq(residentProfiles.id, residentId))
      .limit(1);

    let outstandingBillsCount = 0;
    let totalDueAmount = "0.00";

    if (profileRecords.length > 0) {
      const unitId = profileRecords[0].unitId;

      const [billsCountRes] = await db
        .select({ count: sql<number>`count(*)` })
        .from(maintenanceBills)
        .where(
          and(
            eq(maintenanceBills.unitId, unitId),
            or(eq(maintenanceBills.status, "unpaid"), eq(maintenanceBills.status, "overdue"))
          )
        );

      const [dueSumRes] = await db
        .select({ sum: sql<string>`sum(total_amount)` })
        .from(maintenanceBills)
        .where(
          and(
            eq(maintenanceBills.unitId, unitId),
            or(eq(maintenanceBills.status, "unpaid"), eq(maintenanceBills.status, "overdue"))
          )
        );

      outstandingBillsCount = Number(billsCountRes?.count || 0);
      totalDueAmount = Number(dueSumRes?.sum || 0).toFixed(2);
    }

    // 2. Active Tickets
    const activeComplaints = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        status: complaints.status,
      })
      .from(complaints)
      .where(
        and(
          eq(complaints.raisedById, residentId),
          and(eq(complaints.status, "pending"), eq(complaints.status, "assigned")) // or status not in resolved/rejected
        )
      );

    const activeServiceRequests = await db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        status: serviceRequests.status,
      })
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.raisedById, residentId),
          and(eq(serviceRequests.status, "pending"), eq(serviceRequests.status, "approved")) // status is active (pending/approved)
        )
      );

    // 3. Recent Announcements
    const recentAnnouncements = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .where(
        and(
          inArray(announcements.audience, ["all", "residents"]),
          or(isNull(announcements.expiresAt), gt(announcements.expiresAt, new Date()))
        )
      )
      .orderBy(desc(announcements.createdAt))
      .limit(3);

    return {
      outstandingBillsCount,
      totalDueAmount,
      activeTickets: {
        complaints: activeComplaints,
        serviceRequests: activeServiceRequests,
      },
      recentAnnouncements,
    };
  }

  // GET /api/reports/defaulters
  public static async getDefaultersReport(): Promise<any> {
    const overdueBills = await db
      .select({
        totalAmount: maintenanceBills.totalAmount,
        billingPeriod: maintenanceBills.billingPeriod,
        block: units.block,
        flatNumber: units.flatNumber,
        residentName: users.name,
        email: users.email,
      })
      .from(maintenanceBills)
      .innerJoin(units, eq(maintenanceBills.unitId, units.id))
      .innerJoin(residentProfiles, eq(units.id, residentProfiles.unitId))
      .innerJoin(users, eq(residentProfiles.id, users.id))
      .where(
        and(
          or(eq(maintenanceBills.status, "overdue"), eq(maintenanceBills.status, "unpaid")),
          lt(maintenanceBills.dueDate, new Date())
        )
      );

    const defaultersMap = new Map<string, any>();

    for (const row of overdueBills) {
      const key = `${row.block}-${row.flatNumber}`;
      if (!defaultersMap.has(key)) {
        defaultersMap.set(key, {
          flat: key,
          residentName: row.residentName,
          email: row.email,
          overdueAmountVal: 0.0,
          missedPeriods: [] as string[],
        });
      }

      const entry = defaultersMap.get(key);
      entry.overdueAmountVal += Number(row.totalAmount);
      if (!entry.missedPeriods.includes(row.billingPeriod)) {
        entry.missedPeriods.push(row.billingPeriod);
      }
    }

    const defaultersList = Array.from(defaultersMap.values()).map((d) => ({
      flat: d.flat,
      residentName: d.residentName,
      email: d.email,
      overdueAmount: d.overdueAmountVal.toFixed(2),
      missedPeriods: d.missedPeriods,
    }));

    return {
      defaulters: defaultersList,
    };
  }
}
