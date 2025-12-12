<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('applied_job_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_posting_question_id')->constrained('job_posting_questions')->onDelete('cascade');
            $table->foreignUuid('applied_job_id')->constrained('applied_jobs')->onDelete('cascade');
            $table->text('answer');
            $table->double('ai_score')->nullable();
            $table->double('hr_score')->nullable();
            $table->text('ai_score_meta')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('last_error')->nullable();
            $table->timestamp('ai_screened_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applied_job_answers');
    }
};
