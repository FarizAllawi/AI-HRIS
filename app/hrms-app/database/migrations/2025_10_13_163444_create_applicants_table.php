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
        Schema::create('applicants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');

            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('portfolio_link')->nullable();
            $table->string('resume_file')->nullable();

            // 👇 New columns
            $table->date('date_of_birth')->nullable();
            $table->text('social_media')->nullable(); // e.g. ["twitter" => "...", "linkedin" => "..."]

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
