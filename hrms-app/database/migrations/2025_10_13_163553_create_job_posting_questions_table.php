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
        Schema::create('job_posting_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_posting_id')->constrained('job_postings')->onDelete('cascade');
            $table->text('questions');
            $table->double('weight')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting_questions');
    }
};
