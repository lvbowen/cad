import SecureLS from "secure-ls";
import env from '@/config/env';
export default class LoginHelper {
  private readonly storageKey = "LoginHelper_Password";
  private localStorage = window.localStorage;
  private map = new Map<string, userPassword>();
  private secure: SecureLS;
  private secureKey=env.secret;
  constructor() {
    this.secure = new SecureLS({ isCompression: true, encodingType: "des" });
    this.loadUserPasswordFromLocalStorage();
  }

  setUserPassword(value: userPassword): void {
    this.map.set(env.project, value);
  }
  getUserPassword(): userPassword | undefined {
    return this.map.get(env.project);
  }
  removeUserPassword(): void {
    this.map.delete(env.project);
  }
  saveUserPasswordToLocalStorage(): void {
    const jsonString = JSON.stringify([...this.map]);
    this.localStorage.setItem(
      this.storageKey,
      this.secure.DES.encrypt(jsonString, this.secureKey)
    );
  }
  loadUserPasswordFromLocalStorage(): void {
    const jsonString = this.localStorage.getItem(this.storageKey);
    if (jsonString) {
      this.map = new Map(
        JSON.parse(
          this.secure.DES.decrypt(jsonString, this.secureKey).toString(
            this.secure.enc._Utf8
          )
        )
      );
    }
  }
}

declare global {
  interface userPassword {
    userName: string;
    password: string;
  }
  interface storageUser {
    [key: string]: userPassword;
  }
}
