<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('failed_job_posting_syncs', function (Blueprint $table) {
            $table->id();
            $table->uuid('job_posting_id');
            $table->string('action'); // 'create' or 'update'
            $table->string('error_type'); // 'validation_error', 'client_error', 'max_retries_exceeded'
            $table->text('error_message');
            $table->longText('error_trace')->nullable();
            $table->json('validation_errors')->nullable(); // Structured validation errors
            $table->json('payload'); // The data that was attempted to send
            $table->timestamp('failed_at');
            $table->timestamp('retried_at')->nullable();
            $table->boolean('resolved')->default(false);
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->index(['job_posting_id', 'resolved']);
            $table->index(['error_type', 'resolved']);
            $table->index('failed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_job_posting_syncs');
    }
};
