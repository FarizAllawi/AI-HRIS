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
    public function callback(ScreeningRequest $request)
    {
        $data = $request->validated();

        Log::info('📥 FastAPI callback received:', $data);

        // Validate payload structure expected by ScreeningRequest
        if (!isset($data['screening_results']) || !is_array($data['screening_results'])) {
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
}
