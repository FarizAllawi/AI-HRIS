<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ScreeningController extends Controller
{
    public function uploadCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt',
            'job_description' => 'required|string',
        ]);

        $file = $request->file('csv_file');

        $response = Http::withHeaders([
            'X-API-KEY' => env('FASTAPI_API_KEY', 'secret123'),
        ])->attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post(env('FASTAPI_URL', 'http://ai-service:8100') . '/upload-csv/', [
            'job_description' => $request->job_description,
            'callback_url' => route('screening.callback'),
        ]);

        // FastAPI returns a task_id so we can poll later
        return response()->json($response->json(), $response->status());
    }

    public function callback(Request $request)
    {
        $data = $request->all();

        Log::info('📥 FastAPI callback received:', $data);

        // Validate payload
        if (!isset($data['job_description']) || !isset($data['results'])) {
            Log::warning('⚠️ Invalid callback payload', $data);
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Store results (example)
        // DB::table('screening_results')->insert([
        //     'job_description' => $data['job_description'],
        //     'results' => json_encode($data['results']),
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);

        return response()->json(['status' => 'received']);
    }

    public function pollTask($task_id)
    {
        $response = Http::withHeaders([
            'X-API-KEY' => env('FASTAPI_API_KEY', 'secret123'),
        ])->get(env('FASTAPI_URL', 'http://ai-service:8100') . "/task-status/{$task_id}");

        return $response->json();
    }
}
