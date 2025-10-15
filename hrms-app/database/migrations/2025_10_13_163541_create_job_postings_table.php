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
        Schema::create('job_postings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('departments')->nullable();
            $table->text('requirements');       // store as JSON
            $table->text('responsibilities');  // store as JSON
            $table->text('benefits')->nullable(); // store as JSON
            $table->string('salary')->nullable();
            $table->enum('type', ['full-time', 'contract', 'part-time', 'internship'])->default('full-time');
            $table->enum('status', ['draft', 'published', 'unpublish', 'archived'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
