package com.example.koobnaaba.data.local

import androidx.room.*
import com.example.koobnaaba.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface KoobnaabaDao {

    // --- FARMS ---
    @Query("SELECT * FROM farms ORDER BY createdAt DESC")
    fun getAllFarms(): Flow<List<Farm>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFarm(farm: Farm): Long

    @Update
    suspend fun updateFarm(farm: Farm)

    @Delete
    suspend fun deleteFarm(farm: Farm)

    @Query("DELETE FROM farms WHERE id = :farmId")
    suspend fun deleteFarmById(farmId: Long)

    // --- PARCELS ---
    @Query("SELECT * FROM parcels ORDER BY createdAt DESC")
    fun getAllParcels(): Flow<List<Parcel>>

    @Query("SELECT * FROM parcels WHERE farmId = :farmId")
    fun getParcelsByFarm(farmId: Long): Flow<List<Parcel>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParcel(parcel: Parcel): Long

    @Update
    suspend fun updateParcel(parcel: Parcel)

    @Delete
    suspend fun deleteParcel(parcel: Parcel)

    // --- CROP CYCLES ---
    @Query("SELECT * FROM crop_cycles ORDER BY id DESC")
    fun getAllCropCycles(): Flow<List<CropCycle>>

    @Query("SELECT * FROM crop_cycles WHERE status = 'active' ORDER BY id DESC")
    fun getActiveCropCycles(): Flow<List<CropCycle>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCropCycle(cycle: CropCycle): Long

    @Update
    suspend fun updateCropCycle(cycle: CropCycle)

    @Delete
    suspend fun deleteCropCycle(cycle: CropCycle)

    // --- ACTIVITIES ---
    @Query("SELECT * FROM activity_logs ORDER BY createdAt DESC")
    fun getAllActivities(): Flow<List<ActivityLog>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertActivity(activity: ActivityLog): Long

    @Delete
    suspend fun deleteActivity(activity: ActivityLog)

    // --- COSTS ---
    @Query("SELECT * FROM cost_entries ORDER BY createdAt DESC")
    fun getAllCosts(): Flow<List<CostEntry>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCost(cost: CostEntry): Long

    @Delete
    suspend fun deleteCost(cost: CostEntry)

    // --- HARVESTS ---
    @Query("SELECT * FROM harvests ORDER BY date DESC")
    fun getAllHarvests(): Flow<List<Harvest>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHarvest(harvest: Harvest): Long

    // --- ANIMALS ---
    @Query("SELECT * FROM animals ORDER BY id DESC")
    fun getAllAnimals(): Flow<List<Animal>>

    @Query("SELECT * FROM animals WHERE status = 'actif'")
    fun getActiveAnimals(): Flow<List<Animal>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnimal(animal: Animal): Long

    @Update
    suspend fun updateAnimal(animal: Animal)

    @Delete
    suspend fun deleteAnimal(animal: Animal)

    // --- HEALTH ---
    @Query("SELECT * FROM animal_health_events ORDER BY date DESC")
    fun getAllHealthEvents(): Flow<List<AnimalHealthEvent>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHealthEvent(event: AnimalHealthEvent): Long

    // --- REPRODUCTION ---
    @Query("SELECT * FROM animal_reproductions ORDER BY matingDate DESC")
    fun getAllReproductionEvents(): Flow<List<AnimalReproduction>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReproductionEvent(repro: AnimalReproduction): Long
}
