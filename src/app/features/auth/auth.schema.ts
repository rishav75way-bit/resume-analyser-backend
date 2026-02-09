import { Schema, model, Document, Types, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { CONSTANTS } from '../../common/constants';

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: CONSTANTS.COLLECTIONS.USERS,
    }
);

userSchema.index({ createdAt: -1 });

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
};

export const User: Model<IUser> = model<IUser>(CONSTANTS.COLLECTIONS.USERS, userSchema);
