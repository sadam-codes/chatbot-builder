import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    @InjectModel(User) private userModel: typeof User,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
    });
  }

  // ---------- UTILITIES ----------
  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private generateOtp() {
    return {
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiry: new Date(Date.now() + 5 * 60 * 1000),
    };
  }

  private async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }
  // Inside AuthService
  async sendContactMessage(name: string, email: string, message: string) {
    if (!name || !email || !message) {
      throw new BadRequestException('All fields are required');
    }
    const subject = `Help & Support Message from ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject,
        text,
      });
      return { message: 'Message sent successfully' };
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Failed to send message');
    }
  }

  private async findUserByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  private async findUserById(id: number) {
    return this.userModel.findByPk(id);
  }

  // ---------- REGISTER ----------
  async register(name: string, email: string, password: string, otp?: string) {
    const userExists = await this.findUserByEmail(email);

    if (!otp) {
      if (userExists && userExists.status === 'active') {
        throw new BadRequestException('Email already exists');
      }

      const { code, expiry } = this.generateOtp();
      const hashedPassword = await this.hashPassword(password);

      if (userExists && userExists.status === 'pending') {
        await userExists.update({
          name,
          password: hashedPassword,
          otp: code,
          otpExpiry: expiry,
        });
      } else {
        await this.userModel.create({
          name,
          email,
          password: hashedPassword,
          role: 'user',
          otp: code,
          otpExpiry: expiry,
          status: 'pending',
        });
      }

      await this.sendEmail(
        email,
        'Your Registration OTP Code',
        `Your OTP code is ${code}. It expires in 5 minutes.`,
      );

      return { message: 'OTP sent to email' };
    }

    // OTP verification
    if (!userExists || userExists.status !== 'pending') {
      throw new BadRequestException(
        'Registration not found or already verified',
      );
    }
    if (
      userExists.otp !== otp ||
      !userExists.otpExpiry ||
      userExists.otpExpiry.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await userExists.update({
      otp: null,
      otpExpiry: null,
      status: 'active',
    });

    return {
      id: userExists.id,
      name: userExists.name,
      email: userExists.email,
      role: userExists.role,
      message: 'Registered successfully',
    };
  }

  // ---------- LOGIN ----------
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ---------- UPDATE USER ----------
  async updateRecord(
    adminId: number,
    userId: number,
    name?: string,
    email?: string,
    password?: string,
    role?: 'user' | 'admin',
  ) {
    const adminUser = await this.findUserById(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new UnauthorizedException('Only admin can update user records');
    }

    const user = await this.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const updateData: Partial<User> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await this.hashPassword(password);
    if (role) updateData.role = role;

    await user.update(updateData);

    return {
      message: 'User record updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ---------- DELETE USER ----------
  async deleteUser(id: number) {
    const user = await this.findUserById(id);
    if (!user) throw new BadRequestException('User not found');
    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  // ---------- GET ALL USERS ----------
  async getAll() {
    return this.userModel.findAll();
    
  }

  // ---------- CHANGE PASSWORD ----------
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Old password is incorrect');

    const hashedPassword = await this.hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  // ---------- SEND OTP ----------
  async sendOtp(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user)
      throw new BadRequestException('User with this email does not exist');

    const { code, expiry } = this.generateOtp();
    await user.update({ otp: code, otpExpiry: expiry });

    await this.sendEmail(
      email,
      'Your OTP Code',
      `Your OTP code is ${code}. It expires in 5 minutes.`,
    );

    return { message: 'OTP sent to email' };
  }

  // ---------- RESET PASSWORD ----------
  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    if (
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await user.update({ password: hashedPassword, otp: null, otpExpiry: null });

    return { message: 'Password reset successfully' };
  }
}