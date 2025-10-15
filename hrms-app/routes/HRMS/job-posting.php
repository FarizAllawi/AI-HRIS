<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HRMS\JobPostingController;
// use App\Models\JobPosting;


Route::prefix('HRMS')->group(function () {
     Route::middleware(['auth', 'verified'])->group(function () { // Uncomment this line to enable middleware

        Route::get('job-posting/create', [JobPostingController::class, 'create'])->name('job-posting.create');
        Route::post('job-posting', [JobPostingController::class, 'store'])->name('job-posting.store');

        Route::get('job-posting/{jobPosting}/edit', [JobPostingController::class, 'edit'])->name('job-posting.edit');
        Route::put('job-posting/{jobPosting}', [JobPostingController::class, 'update'])->name('job-posting.update');
        Route::put('job-posting/{jobPosting}/publish', [JobPostingController::class, 'publish'])->name('job-posting.publish');
        Route::put('job-posting/{jobPosting}/archived', [JobPostingController::class, 'archived'])->name('job-posting.archived');
        Route::put('job-posting/{jobPosting}/unarchive', [JobPostingController::class, 'unarchive'])->name('job-posting.unarchive');
        Route::put('job-posting/{jobPosting}/unpublish', [JobPostingController::class, 'unpublish'])->name('job-posting.unpublish');
        Route::delete('job-posting/{jobPosting}', [JobPostingController::class, 'destroy'])->name('job-posting.destroy');

         Route::get('job-posting', [JobPostingController::class, 'index'])->name('job-posting.index');
         Route::get('job-posting/{jobPosting}', [JobPostingController::class, 'show'])->name('job-posting.show');
     });
});
