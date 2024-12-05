import bcrypt from "bcrypt"
import "dotenv/config"
import { PASSWORD_LENGTH } from "../constants/constant";
export const passwordHash = (password) => {
    return bcrypt.hashSync(password, PASSWORD_LENGTH);
}

export const comparePassWord = (password, passwordHash) => {
    return bcrypt.compareSync(password, passwordHash);
}