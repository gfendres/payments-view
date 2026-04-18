import { recoverMessageAddress, verifyMessage, type Address, type Hex } from 'viem';

export interface SiweSignatureDiagnostics {
  clientSignatureValid?: boolean;
  recoveredAddress?: string;
  signatureLength: number;
  clientVerificationError?: string;
}

interface AnalyzeSignedSiweMessageInput {
  address: string;
  message: string;
  signature: string;
}

export const analyzeSignedSiweMessage = async (
  input: AnalyzeSignedSiweMessageInput
): Promise<SiweSignatureDiagnostics> => {
  const signature = input.signature as Hex;

  try {
    const [clientSignatureValid, recoveredAddress] = await Promise.all([
      verifyMessage({
        address: input.address as Address,
        message: input.message,
        signature,
      }),
      recoverMessageAddress({
        message: input.message,
        signature,
      }),
    ]);

    return {
      clientSignatureValid,
      recoveredAddress,
      signatureLength: input.signature.length,
    };
  } catch (error) {
    return {
      signatureLength: input.signature.length,
      clientVerificationError:
        error instanceof Error ? error.message : 'Unknown client signature verification error',
    };
  }
};
