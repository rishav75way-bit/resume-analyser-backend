import { User } from './auth.schema';
import { RegisterInput, LoginInput } from './auth.validators';
import bcrypt from 'bcryptjs';
import { AppError } from '../../common/middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { generateToken } from '../../common/helpers/token';
import { CONSTANTS } from '../../common/constants';

export const register = async (input: RegisterInput) => {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.EMAIL_REGISTERED, StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
        email: input.email,
        passwordHash,
    });

    const token = generateToken({ id: user._id.toString() });

    return {
        user: {
            id: user._id,
            email: user.email,
        },
        token,
    };
};

export const login = async (input: LoginInput) => {
    const user = await User.findOne({ email: input.email });
    if (!user || !(await user.comparePassword(input.password))) {
        throw new AppError(CONSTANTS.MESSAGES.AUTH.INVALID_CREDENTIALS, StatusCodes.UNAUTHORIZED);
    }

    const token = generateToken({ id: user._id.toString() });

    return {
        user: {
            id: user._id,
            email: user.email,
        },
        token,
    };
};
