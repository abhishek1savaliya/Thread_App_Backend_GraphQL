import { prismaClient } from "../lib/db"
import { createHmac, randomBytes } from 'node:crypto';
import JWT from "jsonwebtoken";

const JWT_SECRET = "HareKrishna"

export interface createUserPayload {
    firstName: string
    lastName?: string
    email: string
    password: string
}

export interface getUserTokenPayload {
    email: string
    password: string
}



class UserService {

    private static genrateHash(salt: string, password: string) {
        const hashedPassword = createHmac('sha256', salt)
            .update(password)
            .digest('hex');
        return hashedPassword;
    }

    public static createUser(payload: createUserPayload) {
        const { firstName, lastName, email, password } = payload

        const salt = randomBytes(32).toString("hex")
        const hashedPassword = UserService.genrateHash(password, salt)

        return prismaClient.user.create({
            data: {
                firstName,
                lastName,
                email,
                salt,
                password: hashedPassword
            }
        });
    }

    private static getUserByEmail(email: string) {
        return prismaClient.user.findUnique({ where: { email } })
    }

    public static async getUserToken(payload: getUserTokenPayload) {

        const { email, password } = payload
        const user = await UserService.getUserByEmail(email);
        if (!user) throw new Error('User Not Found!')

        const userSalt = user.salt
        const userHashPassword = UserService.genrateHash(password, userSalt);

        if (userHashPassword !== user.password) throw new Error('Incorrect Password!')

        //Gen Token
        const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET)
        return token
    }
}

export default UserService