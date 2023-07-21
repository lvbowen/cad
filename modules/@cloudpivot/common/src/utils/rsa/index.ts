//@ts-noCheck
import { JSEncrypt } from 'jsencrypt';
/**
 * 对目标字符串进行RSA加密
 * @param value 目标字符串
 * @param publicKey 公钥内容
 * @returns encryptedStr 加密结果
 */
export const RsaEncrypt = (value:string, publicKey: string): string => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encryptedStr:string = encrypt.encrypt(value);
  return encryptedStr;
}