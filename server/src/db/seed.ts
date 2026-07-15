import { db } from "./db";
import { users, units, residentProfiles, committeeMembers } from "./schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  const passwordHash = await bcrypt.hash("Password@123", 10);

  // 1. Create Admin
  const [admin] = await db.insert(users).values({
    email: "admin@society.com",
    name: "System Admin",
    passwordHash,
    role: "admin",
    status: "active",
  }).onConflictDoNothing().returning();
  
  if (admin) console.log("Created Admin:", admin.email);

  // 2. Create Committee User
  let committeeUser = await db.select().from(users).where(eq(users.email, "committee@society.com")).limit(1).then(r => r[0]);
  if (!committeeUser) {
    [committeeUser] = await db.insert(users).values({
      email: "committee@society.com",
      name: "Committee Member",
      passwordHash,
      role: "committee",
      status: "active",
    }).returning();
    console.log("Created Committee User:", committeeUser.email);
  }

  // Create Committee Member profile
  if (committeeUser) {
    const termStart = new Date();
    const termEnd = new Date();
    termEnd.setFullYear(termStart.getFullYear() + 1);

    await db.insert(committeeMembers).values({
      id: committeeUser.id,
      designation: "Secretary",
      portfolio: "General Administration",
      termStart,
      termEnd,
      isActive: true,
    }).onConflictDoNothing();
    console.log("Created Committee Member Profile for:", committeeUser.email);
  }

  // 3. Create Unit
  const [unit] = await db.insert(units).values({
    block: "A",
    flatNumber: "101",
    floor: 1,
    bhkType: "2BHK",
    status: "occupied",
  }).onConflictDoNothing().returning();

  if (unit) console.log("Created Unit:", unit.block, unit.flatNumber);

  // 4. Create Resident (John)
  const [john] = await db.insert(users).values({
    email: "john@society.com",
    name: "John Doe",
    passwordHash,
    role: "resident",
    status: "active",
  }).onConflictDoNothing().returning();

  if (john) {
    console.log("Created Resident:", john.email);
    
    // Link John to Unit via residentProfiles
    if (unit) {
      await db.insert(residentProfiles).values({
        id: john.id,
        unitId: unit.id,
        moveInDate: new Date(),
        type: "owner",
      }).onConflictDoNothing();
      console.log("Linked John to Unit A-101");
    }
  } else {
    // If John already exists, try to link him anyway if the unit exists
    const johnRecord = await db.select().from(users).where(eq(users.email, "john@society.com")).limit(1);
    const unitRecord = await db.select().from(units).where(eq(units.block, "A")).limit(1);
    
    if (johnRecord.length > 0 && unitRecord.length > 0) {
      await db.insert(residentProfiles).values({
        id: johnRecord[0].id,
        unitId: unitRecord[0].id,
        moveInDate: new Date(),
        type: "owner",
      }).onConflictDoNothing();
      console.log("Linked existing John to existing Unit");
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
