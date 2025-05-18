import httpStatus from 'http-status';
import CustomError from '../../errors/customError';
import generateToken from '../../utils/generateToken';
import { IUser } from './user.interface';
import User from './user.model';
import verifyPassword from '../../utils/verifyPassword';
import bcrypt from 'bcrypt';
import { TUserRole, TUserStatus, UserRole } from '../../constant/userRole';

class UserServices {
  private model = User;

  // get profile
  async getSelf(userId: string) {
    return this.model.findById(userId);
  }

  // register new user
  async register(payload: IUser) {
    const user = await this.model.create(payload);

    const token = generateToken({ _id: user._id, email: user.email });
    return { token };
  }

  // login existing user
  async login(payload: { email: string; password: string }) {
    const user = await this.model.findOne({ email: payload.email }).select('+password');

    if (user) {
      await verifyPassword(payload.password, user.password);

      const token = generateToken({ _id: user._id, email: user.email });
      return { token };
    } else {
      throw new CustomError(httpStatus.BAD_REQUEST, 'WrongCredentials', 'Authentication');
    }
  }

  // update user profile
  async updateProfile(id: string, payload: Partial<IUser>) {
    return this.model.findByIdAndUpdate(id, payload);
  }

  // change Password
  async changePassword(userId: string, payload: { oldPassword: string; newPassword: string }) {
    const user = await this.model.findById(userId).select('+password');
    if (!user) throw new CustomError(httpStatus.NOT_FOUND, 'User not found', 'User');

    const matchedPassword = await bcrypt.compare(payload.oldPassword, user.password);

    if (!matchedPassword) {
      throw new CustomError(400, 'Old Password does not matched!', 'Authentication');
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
    const updatedUser = await this.model.findByIdAndUpdate(userId, { password: hashedPassword });

    return updatedUser;
  }

  // Admin: Get all users with pagination and filters
  async getAllUsers(query: any) {
    const { page = 1, limit = 10, role, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.model.find(filter)
        .select('-password')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      this.model.countDocuments(filter)
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  // Admin: Update user role
  async updateUserRole(userId: string, role: TUserRole) {
    const user = await this.model.findById(userId);
    if (!user) {
      throw new CustomError(httpStatus.NOT_FOUND, 'User not found', 'User');
    }

    return this.model.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
  }

  // Admin: Update user status
  async updateUserStatus(userId: string, status: TUserStatus) {
    const user = await this.model.findById(userId);
    if (!user) {
      throw new CustomError(httpStatus.NOT_FOUND, 'User not found', 'User');
    }

    return this.model.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');
  }

  // Create admin user
  async createAdmin(payload: Omit<IUser, 'role'>) {
    // Check if user already exists
    const existingUser = await this.model.findOne({ email: payload.email });
    if (existingUser) {
      throw new CustomError(httpStatus.CONFLICT, 'User already exists', 'User');
    }

    // Create admin user
    const adminUser = await this.model.create({
      ...payload,
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });

    const token = generateToken({ _id: adminUser._id, email: adminUser.email });
    return { token };
  }
}

const userServices = new UserServices();
export default userServices;
