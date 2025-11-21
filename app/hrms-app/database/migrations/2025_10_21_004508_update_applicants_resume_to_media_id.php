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
        Schema::table('applicants', function (Blueprint $table) {
            // Drop the old column
            if (Schema::hasColumn('applicants', 'resume_file')) {
                $table->dropColumn('resume_file');
            }

            // Add the new foreign key column for media
            $table->foreignUuid('resume_media_id')
                ->nullable()
                ->after('portfolio_link')
                ->constrained('media')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            // Drop the foreign key constraint and column
            if (Schema::hasColumn('applicants', 'resume_media_id')) {
                $table->dropForeign(['resume_media_id']);
                $table->dropColumn('resume_media_id');
            }

            // Recreate the old column
            $table->string('resume_file')->nullable()->after('portfolio_link');
        });
    }
};
