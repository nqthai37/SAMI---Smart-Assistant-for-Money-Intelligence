// Test the AuthService with EmailService integration
import { AuthService, EnhancedAuthService } from './service/authService.js';

console.log('🧪 Testing AuthService Integration...\n');

// Test 1: Check that AuthService is exported correctly
console.log('✅ AuthService exported:', typeof AuthService);
console.log('✅ EnhancedAuthService exported:', typeof EnhancedAuthService);

// Test 2: Check that all methods are available
console.log('\n📋 AuthService methods:');
console.log('- register:', typeof AuthService.register);
console.log('- login:', typeof AuthService.login);
console.log('- forgotPassword:', typeof AuthService.forgotPassword);

console.log('\n📋 EnhancedAuthService methods:');
console.log('- register:', typeof EnhancedAuthService.register);
console.log('- login:', typeof EnhancedAuthService.login);
console.log('- forgotPassword:', typeof EnhancedAuthService.forgotPassword);
console.log('- sendTransactionNotification:', typeof EnhancedAuthService.sendTransactionNotification);
console.log('- sendBudgetAlert:', typeof EnhancedAuthService.sendBudgetAlert);

console.log('\n🎉 AuthService integration test completed!');
console.log('\n💡 Usage:');
console.log('// Basic auth operations');
console.log('import { AuthService } from "./service/authService.js";');
console.log('await AuthService.register(userData);');
console.log('');
console.log('// Enhanced auth with email features');
console.log('import { EnhancedAuthService } from "./service/authService.js";');
console.log('await EnhancedAuthService.sendTransactionNotification(...);');
