
import { measurePerformance, mockCodeSamples } from './eslint-test-utils';

// Load Tests for ESLint System
export class ESLintLoadTests {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async testSystemLoad(concurrentUsers: number, requestsPerUser: number) {
    const results = [];
    
    console.log(`Starting load test: ${concurrentUsers} users, ${requestsPerUser} requests each`);
    
    try {
      const { duration } = await measurePerformance(async () => {
        const userPromises = Array(concurrentUsers).fill(0).map(async (_, userIndex) => {
          const userRequests = Array(requestsPerUser).fill(0).map(async (_, reqIndex) => {
            const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-User-ID': `load-test-user-${userIndex}`,
                'X-Request-ID': `${userIndex}-${reqIndex}`
              },
              body: JSON.stringify({
                code: mockCodeSamples.withWarnings,
                config: { rules: { 'no-console': 'warn', 'no-unused-vars': 'warn' } }
              })
            });
            
            return {
              ok: response.ok,
              status: response.status,
              userIndex,
              requestIndex: reqIndex
            };
          });
          
          return Promise.all(userRequests);
        });
        
        const allResults = await Promise.all(userPromises);
        return allResults.flat();
      }, `Load test: ${concurrentUsers}x${requestsPerUser}`);

      const totalRequests = concurrentUsers * requestsPerUser;
      const requestsPerSecond = totalRequests / (duration / 1000);
      
      results.push({
        test: 'System load test',
        passed: duration < 30000 && requestsPerSecond > 5, // Should handle at least 5 RPS
        duration,
        totalRequests,
        requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
        concurrentUsers,
        requestsPerUser
      });
    } catch (error) {
      results.push({
        test: 'System load test',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testQueueStress() {
    const results = [];
    const queueSize = 50;

    try {
      const { duration } = await measurePerformance(async () => {
        // Simulate rapid job scheduling
        const schedulePromises = Array(queueSize).fill(0).map((_, i) =>
          fetch(`${this.baseUrl}/functions/v1/eslint-scheduler`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({
              action: 'schedule',
              project_id: `stress-test-project-${i}`,
              trigger_type: 'manual',
              priority: Math.floor(Math.random() * 10) + 1
            })
          })
        );
        
        const responses = await Promise.all(schedulePromises);
        return responses.map(r => ({ ok: r.ok, status: r.status }));
      }, 'Queue stress test');

      results.push({
        test: 'Queue stress test',
        passed: duration < 15000, // Should handle queue operations efficiently
        duration,
        queueSize
      });
    } catch (error) {
      results.push({
        test: 'Queue stress test',
        passed: false,
        errors: [error.message]
      });
    }

    return results;
  }

  async testMemoryUsage() {
    const results = [];
    
    // Test with progressively larger code samples
    const sizes = [1000, 5000, 10000, 25000]; // lines of code
    
    for (const size of sizes) {
      try {
        const largeCode = Array(size).fill(0).map((_, i) => 
          `const var${i} = ${i}; console.log(var${i});`
        ).join('\n');

        const { duration } = await measurePerformance(async () => {
          const response = await fetch(`${this.baseUrl}/functions/v1/eslint-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: largeCode,
              config: { rules: { 'no-console': 'warn' } }
            })
          });
          return response.json();
        }, `Memory test: ${size} lines`);

        results.push({
          test: `Memory usage test (${size} lines)`,
          passed: duration < 20000, // Should complete within reasonable time
          duration,
          linesOfCode: size,
          memoryEfficient: duration < (size * 2) // Rough heuristic
        });
      } catch (error) {
        results.push({
          test: `Memory usage test (${size} lines)`,
          passed: false,
          errors: [error.message]
        });
      }
    }

    return results;
  }

  async runLoadTests() {
    console.log('Starting ESLint Load Tests...');
    
    // Light load test
    const lightLoad = await this.testSystemLoad(5, 10);
    
    // Medium load test
    const mediumLoad = await this.testSystemLoad(10, 20);
    
    // Queue stress test
    const queueTests = await this.testQueueStress();
    
    // Memory usage tests
    const memoryTests = await this.testMemoryUsage();
    
    const allTests = [...lightLoad, ...mediumLoad, ...queueTests, ...memoryTests];
    const passed = allTests.filter(t => t.passed).length;
    const total = allTests.length;
    
    console.log(`Load Tests: ${passed}/${total} passed`);
    
    return {
      summary: { passed, total, percentage: (passed / total) * 100 },
      results: allTests
    };
  }
}
