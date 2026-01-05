import { describe, test, expect } from 'bun:test';
import { Wallet } from '../wallet';
import { EthereumAddress } from '../../../transaction/value-objects/ethereum-address';

describe('Wallet', () => {
  const address = EthereumAddress.fromTrusted('0x1234567890123456789012345678901234567890');

  describe('create', () => {
    test('should create wallet with required fields', () => {
      const wallet = Wallet.create({
        address,
        chainId: 100,
        isConnected: true,
      });

      expect(wallet.address).toBe(address);
      expect(wallet.chainId).toBe(100);
      expect(wallet.isConnected).toBe(true);
    });
  });

  describe('address', () => {
    test('should return Ethereum address', () => {
      const wallet = Wallet.create({
        address,
        chainId: 100,
        isConnected: true,
      });

      expect(wallet.address).toBe(address);
    });
  });

  describe('chainId', () => {
    test('should return chain ID', () => {
      const wallet = Wallet.create({
        address,
        chainId: 100,
        isConnected: true,
      });

      expect(wallet.chainId).toBe(100);
    });
  });

  describe('isConnected', () => {
    test('should return connection status', () => {
      const connected = Wallet.create({
        address,
        chainId: 100,
        isConnected: true,
      });

      const disconnected = Wallet.create({
        address,
        chainId: 100,
        isConnected: false,
      });

      expect(connected.isConnected).toBe(true);
      expect(disconnected.isConnected).toBe(false);
    });
  });

  describe('isGnosisChain', () => {
    test('should return true for Gnosis Chain', () => {
      const wallet = Wallet.create({
        address,
        chainId: 100,
        isConnected: true,
      });

      expect(wallet.isGnosisChain).toBe(true);
    });

    test('should return false for other chains', () => {
      const wallet = Wallet.create({
        address,
        chainId: 1, // Ethereum mainnet
        isConnected: true,
      });

      expect(wallet.isGnosisChain).toBe(false);
    });
  });

  describe('disconnect', () => {
    test('should set isConnected to false', () => {
      const wallet = Wallet.create({
        address,
        chainId: 100,
        isConnected: true,
      });

      wallet.disconnect();

      expect(wallet.isConnected).toBe(false);
    });
  });
});

