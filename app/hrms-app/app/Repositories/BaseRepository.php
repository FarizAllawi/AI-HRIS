<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseRepository
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Return all models with optional filters.
     */
    public function all(array $filters = []): Collection
    {
        $query = $this->model->newQuery();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        return $query->latest()->get();
    }

    /**
     * Find a model by UUID.
     */
    public function find(string $id): ?Model
    {
        return $this->model->find($id);
    }

    /**
     * Create safely using a transaction.
     */
    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            return $this->model->create($data);
        });
    }

    /**
     * Update safely with row-level locking.
     * Prevents race conditions where multiple processes update same record.
     */
    public function update(string $id, array $data): ?Model
    {
        return DB::transaction(function () use ($id, $data) {
            $record = $this->model->lockForUpdate()->findOrFail($id);
            $record->update($data);
            return $record;
        });
    }

    /**
     * Delete safely inside a transaction.
     */
    public function delete(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $record = $this->model->lockForUpdate()->findOrFail($id);
            return $record->delete();
        });
    }
}
