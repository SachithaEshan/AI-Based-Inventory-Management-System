export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SUPPLIER: 'SUPPLIER',
  USER: 'USER'
} as const;

export const UserStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  BLOCK: 'BLOCK'
} as const;

export type TUserRole = 'ADMIN' | 'MANAGER' | 'SUPPLIER' | 'USER';
export type TUserStatus = 'PENDING' | 'ACTIVE' | 'BLOCK';

// Role-based permissions
export const RolePermissions = {
  ADMIN: ['*'], // Admin has all permissions
  MANAGER: [
    'view_users',
    'manage_inventory',
    'manage_orders',
    'view_reports',
    'manage_suppliers'
  ],
  SUPPLIER: [
    'view_own_products',
    'update_own_products',
    'view_own_orders'
  ],
  USER: [
    'view_own_profile',
    'update_own_profile'
  ]
} as const;
