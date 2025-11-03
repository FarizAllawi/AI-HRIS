<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Http\Requests\HRMS\ScreeningRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ScreeningController extends Controller
{
    public function callback(ScreeningRequest $request): Response
    {
        $data = $request->validated();

        Log::info('📥 FastAPI callback received:', $data);

        // Validate payload structure expected by ScreeningRequest
        if (!isset($data['screening_result']) || !is_array($data['screening_result'])) {
            Log::warning('⚠️ Invalid callback payload', $data);
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        try {
            // Resolve repository and apply results
            $repo = app(\App\Repositories\ApplyJob\ApplyJobRepository::class);
            $repo->applyJobResult($data);
        } catch (\Throwable $e) {
            Log::error('❌ Failed to apply screening results: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to process results'], 500);
        }

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
