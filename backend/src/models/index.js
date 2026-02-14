import { sequelize } from "../config/database.js";
import { initUser } from "./User.js";
import { initVendor } from "./Vendor.js";
import { initVendorApplication } from "./VendorApplication.js";
import { initStand } from "./Stand.js";
import { initAllocation } from "./Allocation.js";
import { initPayment } from "./Payment.js";
import { initSetting } from "./Setting.js";

const User = initUser(sequelize);
const Vendor = initVendor(sequelize);
const VendorApplication = initVendorApplication(sequelize);
const Stand = initStand(sequelize);
const Allocation = initAllocation(sequelize);
const Payment = initPayment(sequelize);
const Setting = initSetting(sequelize);

User.hasOne(Vendor, { foreignKey: "userId", as: "vendorProfile" });
Vendor.belongsTo(User, { foreignKey: "userId", as: "user" });

Vendor.hasMany(Allocation, { foreignKey: "vendorId", as: "allocations" });
Allocation.belongsTo(Vendor, { foreignKey: "vendorId", as: "vendor" });

Stand.hasMany(Allocation, { foreignKey: "stallId", as: "allocations" });
Allocation.belongsTo(Stand, { foreignKey: "stallId", as: "stall" });

Allocation.hasMany(Payment, { foreignKey: "allocationId", as: "payments" });
Payment.belongsTo(Allocation, { foreignKey: "allocationId", as: "allocation" });

export { sequelize, User, Vendor, VendorApplication, Stand, Allocation, Payment, Setting };

export async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
}
