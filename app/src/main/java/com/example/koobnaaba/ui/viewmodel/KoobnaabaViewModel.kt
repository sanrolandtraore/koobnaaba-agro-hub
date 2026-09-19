package com.example.koobnaaba.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.koobnaaba.data.model.*
import com.example.koobnaaba.data.repository.KoobnaabaRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class KoobnaabaViewModel(private val repository: KoobnaabaRepository) : ViewModel() {

    val farms: StateFlow<List<Farm>> = repository.allFarms
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val parcels: StateFlow<List<Parcel>> = repository.allParcels
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val cropCycles: StateFlow<List<CropCycle>> = repository.allCropCycles
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val activeCycles: StateFlow<List<CropCycle>> = repository.activeCropCycles
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val activities: StateFlow<List<ActivityLog>> = repository.allActivities
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val costs: StateFlow<List<CostEntry>> = repository.allCosts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val harvests: StateFlow<List<Harvest>> = repository.allHarvests
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val animals: StateFlow<List<Animal>> = repository.allAnimals
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val activeAnimals: StateFlow<List<Animal>> = repository.activeAnimals
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val healthEvents: StateFlow<List<AnimalHealthEvent>> = repository.allHealthEvents
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Actions ---

    fun addFarm(name: String, location: String, areaHa: Double, climate: String, lat: Double?, lng: Double?) {
        viewModelScope.launch {
            repository.insertFarm(
                Farm(
                    name = name,
                    locationName = location,
                    totalAreaHa = areaHa,
                    climateZone = climate,
                    latitude = lat,
                    longitude = lng
                )
            )
        }
    }

    fun deleteFarm(farm: Farm) {
        viewModelScope.launch {
            repository.deleteFarm(farm)
        }
    }

    fun addParcel(farmId: Long, name: String, areaHa: Double, soilType: String, irrigation: String, gps: String) {
        viewModelScope.launch {
            repository.insertParcel(
                Parcel(
                    farmId = farmId,
                    name = name,
                    areaHa = areaHa,
                    soilType = soilType,
                    irrigationType = irrigation,
                    polygonGps = gps
                )
            )
        }
    }

    fun deleteParcel(parcel: Parcel) {
        viewModelScope.launch {
            repository.deleteParcel(parcel)
        }
    }

    fun addCropCycle(
        parcelId: Long,
        cropName: String,
        category: String,
        season: String,
        plantingDate: String,
        harvestDate: String,
        expectedYield: Double,
        notes: String
    ) {
        viewModelScope.launch {
            repository.insertCropCycle(
                CropCycle(
                    parcelId = parcelId,
                    cropName = cropName,
                    cropCategory = category,
                    season = season,
                    plantingDate = plantingDate,
                    expectedHarvestDate = harvestDate,
                    expectedYieldKg = expectedYield,
                    status = "active",
                    notes = notes
                )
            )
        }
    }

    fun addActivity(cycleId: Long?, parcelId: Long?, type: String, description: String, date: String, cost: Double) {
        viewModelScope.launch {
            repository.insertActivity(
                ActivityLog(
                    cropCycleId = cycleId,
                    parcelId = parcelId,
                    activityType = type,
                    description = description,
                    date = date,
                    costAmount = cost
                )
            )
            if (cost > 0) {
                repository.insertCost(
                    CostEntry(
                        category = type,
                        description = description,
                        amount = cost,
                        date = date,
                        cropCycleId = cycleId
                    )
                )
            }
        }
    }

    fun addCost(category: String, description: String, amount: Double, date: String) {
        viewModelScope.launch {
            repository.insertCost(
                CostEntry(
                    category = category,
                    description = description,
                    amount = amount,
                    date = date
                )
            )
        }
    }

    fun addAnimal(tag: String, species: String, breed: String, gender: String, birthDate: String, weight: Double, isGroup: Boolean, size: Int, notes: String) {
        viewModelScope.launch {
            repository.insertAnimal(
                Animal(
                    tagNumber = tag,
                    species = species,
                    breed = breed,
                    gender = gender,
                    birthDate = birthDate,
                    weightKg = weight,
                    isGroup = isGroup,
                    groupSize = size,
                    notes = notes
                )
            )
        }
    }

    fun addHealthEvent(animalId: Long, eventType: String, medicine: String, date: String, cost: Double, notes: String) {
        viewModelScope.launch {
            repository.insertHealthEvent(
                AnimalHealthEvent(
                    animalId = animalId,
                    eventType = eventType,
                    medicineName = medicine,
                    date = date,
                    costFcfa = cost,
                    notes = notes
                )
            )
        }
    }
}

class KoobnaabaViewModelFactory(private val repository: KoobnaabaRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(KoobnaabaViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return KoobnaabaViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
