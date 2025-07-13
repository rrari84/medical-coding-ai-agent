const { Pool } = require('pg');

//Purpose: This class handles everything related to the postgresql database
//1. It saves test results
//2. Fetches performance metrics
//3. Running Summary/comparison queries
//4. Supporting the frontend dashboard with structured data
//It wraps the SQL queries behind a clean, async JavaScript methods using the pg PostgreSQL driver.

class DatabaseService {
    //This initializes a postgreSQL connection pool using environment variables or defaults
    //It also ensures reusable DB connections across requests
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'medical_coding_ai',
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || 5432,
        });
    }

    //This will store a new test session, which will include:
    //*Test summary(name, agent, stats)
    //*Individual question performance
    //*Triggers agent performance recalculation
    async saveTestRun(testData) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN'); //Starts a transaction to ensure atomicity

            //Insert test run
            const testRunQuery = `
                INSERT INTO test_runs ( 
                    test_name, agent_type, questions_tested, correct_answers, 
                    accuracy, avg_confidence, avg_processing_time, total_processing_time,
                    test_duration, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `; //Logs overall test metics

            const testRunValues = [
                testData.test_name,
                testData.agent_type,
                testData.questions_tested,
                testData.correct_answers,
                testData.accuracy,
                testData.avg_confidence,
                testData.avg_processing_time,
                testData.total_processing_time,
                testData.test_duration,
                JSON.stringify(testData.metadata || {})
            ];

            const testRunResult = await client.query(testRunQuery, testRunValues);
            const testRunId = testRunResult.rows[0].id;

            //Insert individual question results
            if (testData.question_results && testData.question_results.length > 0) {
                const questionQuery = `
                    INSERT INTO question_results (
                        test_run_id, question_id, question_text, question_category,
                        correct_answer, ai_answer, is_correct, confidence, 
                        processing_time, reasoning
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `; //Stores each question's results

                for (const result of testData.question_results) {
                    await client.query(questionQuery, [
                        testRunId,
                        result.question_id,
                        result.question_text,
                        result.question_category,
                        result.correct_answer,
                        result.ai_answer,
                        result.is_correct,
                        result.confidence,
                        result.processing_time,
                        result.reasoning
                    ]);
                }
            }

            //Update agent performance summary, recomputes aggregates(accuracy and confidence)
            await this.updateAgentPerformance(client, testData.agent_type);

            await client.query('COMMIT'); //Saves everything
            return testRunId;

        } catch (error) {
            await client.query('ROLLBACK'); //And if anything fails, it will rollback
            throw error;
        } finally {
            client.release();
        }
    }

    //This will recalculate the agents summary row in agent_performance
    async updateAgentPerformance(client, agentType) {
        const updateQuery = `
            UPDATE agent_performance SET
                total_tests = (SELECT COUNT(*) FROM test_runs WHERE agent_type = $1),
                total_questions = (SELECT SUM(questions_tested) FROM test_runs WHERE agent_type = $1),
                total_correct = (SELECT SUM(correct_answers) FROM test_runs WHERE agent_type = $1),
                best_accuracy = (SELECT MAX(accuracy) FROM test_runs WHERE agent_type = $1),
                avg_accuracy = (SELECT AVG(accuracy) FROM test_runs WHERE agent_type = $1),
                avg_confidence = (SELECT AVG(avg_confidence) FROM test_runs WHERE agent_type = $1),
                last_test_date = (SELECT MAX(created_at) FROM test_runs WHERE agent_type = $1),
                updated_at = CURRENT_TIMESTAMP
            WHERE agent_type = $1
        `; //This will keep the dashboard leaderboards up-to-date automatically

        await client.query(updateQuery, [agentType]);
    }

    //This gets all or one agent's stats from agent_performance
    //ordered by avg_accuracy for leaderboard-style ranking
    async getAgentPerformance(agentType = null) {
        let query = 'SELECT * FROM agent_performance';
        let values = [];

        if (agentType) {
            query += ' WHERE agent_type = $1';
            values = [agentType];
        }

        query += ' ORDER BY avg_accuracy DESC';

        const result = await this.pool.query(query, values);
        return result.rows;
    }

    //This will return past test runs + number of questions per test
    //Includes: test metadata, JOIN with question_results to count questions
    //Optional filter by agent type
    //Sorted by created_at (latest first)
    async getTestHistory(agentType = null, limit = 50) {
        let query = `
            SELECT tr.*, 
                   COUNT(qr.id) as question_count
            FROM test_runs tr
            LEFT JOIN question_results qr ON tr.id = qr.test_run_id
        `;
        let values = [];

        if (agentType) {
            query += ' WHERE tr.agent_type = $1';
            values = [agentType];
        }

        query += `
            GROUP BY tr.id
            ORDER BY tr.created_at DESC
            LIMIT $${values.length + 1}
        `;
        values.push(limit);

        const result = await this.pool.query(query, values);
        return result.rows;
    }

    //Simple call to test_comparison, pre-aggregated table
    async getTestComparison() {
        const query = 'SELECT * FROM test_comparison';
        const result = await this.pool.query(query);
        return result.rows;
    }

    //This will returns every question for a given test run, ordered by question_id
    async getQuestionResults(testRunId) {
        const query = `
            SELECT * FROM question_results 
            WHERE test_run_id = $1 
            ORDER BY question_id
        `;
        const result = await this.pool.query(query, [testRunId]);
        return result.rows;
    }

    //This groups all question results by question_category like CPT/ICD
    async getPerformanceByCategory(agentType = null) {
        let query = `
            SELECT 
                qr.question_category,
                COUNT(*) as total_questions,
                SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_answers,
                ROUND(AVG(CASE WHEN qr.is_correct THEN 100.0 ELSE 0.0 END), 2) as accuracy,
                ROUND(AVG(qr.confidence), 3) as avg_confidence
            FROM question_results qr
            JOIN test_runs tr ON qr.test_run_id = tr.id
        `;
        let values = [];

        if (agentType) {
            query += ' WHERE tr.agent_type = $1';
            values = [agentType];
        } //added a optional filter

        query += `
            GROUP BY qr.question_category
            ORDER BY accuracy DESC
        `;

        const result = await this.pool.query(query, values);
        return result.rows;
    }

    //This removes one test run from test_runs and all associated question results
    async deleteTestRun(testRunId) {
        const client = await this.pool.connect();
            try {
                await client.query('BEGIN');
        
                //Delete question results first (foreign key constraint)
                await client.query('DELETE FROM question_results WHERE test_run_id = $1', [testRunId]);
        
                //Then delete the test run
                await client.query('DELETE FROM test_runs WHERE id = $1', [testRunId]);
        
                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

    //This aggregates daily performance stats across test runs
    async getDetailedComparison(days = 30) {
        const query = `
            SELECT 
                tr.agent_type,
                DATE(tr.created_at) as test_date,
                COUNT(*) as tests_run,
                AVG(tr.accuracy) as avg_accuracy,
                MAX(tr.accuracy) as best_accuracy,
                AVG(tr.avg_confidence) as avg_confidence,
                SUM(tr.questions_tested) as total_questions
            FROM test_runs tr
            WHERE tr.created_at >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY tr.agent_type, DATE(tr.created_at)
            ORDER BY test_date DESC, avg_accuracy DESC
        `;

        const result = await this.pool.query(query);
        return result.rows;
    } //useful for regression detection

    //Gracefully will shut down the postgresql pool when the app exits
    async close() {
        await this.pool.end();
    }
}

module.exports = DatabaseService;