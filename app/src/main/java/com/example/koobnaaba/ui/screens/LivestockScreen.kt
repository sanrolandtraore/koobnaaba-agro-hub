package com.example.koobnaaba.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.koobnaaba.data.model.Animal
import com.example.koobnaaba.ui.theme.BurntAmber
import com.example.koobnaaba.ui.theme.ForestGreenPrimary
import com.example.koobnaaba.ui.theme.LightSage
import com.example.koobnaaba.ui.theme.Terracotta
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel

val SPECIES_LIST = listOf(
    "bovin" to "Bovin",
    "ovin" to "Ovin",
    "caprin" to "Caprin",
    "porcin" to "Porcin",
    "volaille" to "Volaille",
    "pisciculture" to "Pisciculture"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LivestockScreen(
    viewModel: KoobnaabaViewModel,
    modifier: Modifier = Modifier
) {
    val animals by viewModel.animals.collectAsState()
    val healthEvents by viewModel.healthEvents.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    var showAddAnimalDialog by remember { mutableStateOf(false) }
    var showAddHealthDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestion du Cheptel & Élevage") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    if (selectedTab == 0) showAddAnimalDialog = true else showAddHealthDialog = true
                },
                containerColor = ForestGreenPrimary,
                contentColor = MaterialTheme.colorScheme.surface,
                modifier = Modifier.testTag("fab_add_livestock")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter")
            }
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            TabRow(selectedTabIndex = selectedTab) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Animaux (${animals.size})") }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Soins & Santé (${healthEvents.size})") }
                )
            }

            if (selectedTab == 0) {
                if (animals.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "Aucun animal enregistré dans le cheptel.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(animals, key = { it.id }) { animal ->
                            AnimalCard(
                                animal = animal,
                                onDelete = { viewModel.deleteAnimal(animal) }
                            )
                        }
                    }
                }
            } else {
                if (healthEvents.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "Aucun soin vétérinaire ou vaccin enregistré.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(healthEvents, key = { it.id }) { event ->
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = CardDefaults.outlinedCardBorder(),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            event.eventType,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = Terracotta
                                        )
                                        Text(
                                            event.medicineName,
                                            style = MaterialTheme.typography.bodyMedium
                                        )
                                        Text(
                                            event.date,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    if (event.costFcfa > 0) {
                                        Text(
                                            "${event.costFcfa.toInt()} F",
                                            style = MaterialTheme.typography.labelLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = BurntAmber
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (showAddAnimalDialog) {
            AddAnimalDialog(
                onDismiss = { showAddAnimalDialog = false },
                onConfirm = { tag, species, breed, gender, birthDate, weight, isGroup, size, notes ->
                    viewModel.addAnimal(tag, species, breed, gender, birthDate, weight, isGroup, size, notes)
                    showAddAnimalDialog = false
                }
            )
        }

        if (showAddHealthDialog) {
            AddHealthDialog(
                animals = animals,
                onDismiss = { showAddHealthDialog = false },
                onConfirm = { animalId, eventType, med, date, cost, notes ->
                    viewModel.addHealthEvent(animalId, eventType, med, date, cost, notes)
                    showAddHealthDialog = false
                }
            )
        }
    }
}

@Composable
fun AnimalCard(
    animal: Animal,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = animal.tagNumber,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = LightSage
                        ) {
                            Text(
                                text = animal.species.replaceFirstChar { it.uppercase() },
                                style = MaterialTheme.typography.labelSmall,
                                color = ForestGreenPrimary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${animal.breed} • Sexe: ${animal.gender}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Supprimer", tint = MaterialTheme.colorScheme.error)
                }
            }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = if (animal.isGroup) "Lot de ${animal.groupSize} têtes" else "Poids: ${animal.weightKg} kg",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Né le: ${animal.birthDate}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddAnimalDialog(
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String, String, Double, Boolean, Int, String) -> Unit
) {
    var tag by remember { mutableStateOf("") }
    var species by remember { mutableStateOf("bovin") }
    var breed by remember { mutableStateOf("Zébu Goudali") }
    var gender by remember { mutableStateOf("F") }
    var birthDate by remember { mutableStateOf("01/01/2025") }
    var weightText by remember { mutableStateOf("250") }
    var isGroup by remember { mutableStateOf(false) }
    var groupSizeText by remember { mutableStateOf("1") }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Enregistrer Animal / Lot") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = tag,
                    onValueChange = { tag = it },
                    label = { Text("Numéro boucle / Référence") },
                    placeholder = { Text("Ex: BF-OUAG-102") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = species,
                    onValueChange = { species = it },
                    label = { Text("Espèce (bovin, ovin, caprin, volaille)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = breed,
                    onValueChange = { breed = it },
                    label = { Text("Race") },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = gender,
                        onValueChange = { gender = it },
                        label = { Text("Sexe (M/F)") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = weightText,
                        onValueChange = { weightText = it },
                        label = { Text("Poids (kg)") },
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = isGroup, onCheckedChange = { isGroup = it })
                    Text("Il s'agit d'un lot d'animaux (ex: volailles)")
                }
                if (isGroup) {
                    OutlinedTextField(
                        value = groupSizeText,
                        onValueChange = { groupSizeText = it },
                        label = { Text("Nombre de sujets dans le lot") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val w = weightText.toDoubleOrNull() ?: 50.0
                    val s = groupSizeText.toIntOrNull() ?: 1
                    if (tag.isNotBlank()) {
                        onConfirm(tag, species, breed, gender, birthDate, w, isGroup, s, notes)
                    }
                },
                enabled = tag.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
            ) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Annuler") }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddHealthDialog(
    animals: List<Animal>,
    onDismiss: () -> Unit,
    onConfirm: (Long, String, String, String, Double, String) -> Unit
) {
    var selectedAnimalId by remember { mutableStateOf(animals.firstOrNull()?.id ?: 0L) }
    var eventType by remember { mutableStateOf("Vaccination") }
    var medicine by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("19/09/2026") }
    var costText by remember { mutableStateOf("5000") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Enregistrer Traitement Vétérinaire") },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = eventType,
                    onValueChange = { eventType = it },
                    label = { Text("Type d'intervention (Vaccin, Déparasitage...)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = medicine,
                    onValueChange = { medicine = it },
                    label = { Text("Médicament / Produit injecté") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = costText,
                    onValueChange = { costText = it },
                    label = { Text("Coût du produit (FCFA)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val c = costText.toDoubleOrNull() ?: 0.0
                    onConfirm(selectedAnimalId, eventType, medicine, date, c, "")
                },
                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
            ) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Annuler") }
        }
    )
}
