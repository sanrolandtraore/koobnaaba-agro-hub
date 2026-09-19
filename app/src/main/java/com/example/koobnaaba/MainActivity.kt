package com.example.koobnaaba

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.koobnaaba.ui.navigation.Screen
import com.example.koobnaaba.ui.navigation.bottomNavItems
import com.example.koobnaaba.ui.screens.*
import com.example.koobnaaba.ui.theme.KoobnaabaTheme
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModel
import com.example.koobnaaba.ui.viewmodel.KoobnaabaViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: KoobnaabaViewModel by viewModels {
        val app = application as KoobnaabaApp
        KoobnaabaViewModelFactory(app.repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            KoobnaabaTheme {
                MainAppContent(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppContent(viewModel: KoobnaabaViewModel) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp,
                    modifier = Modifier.testTag("bottom_nav_bar")
                ) {
                    bottomNavItems.forEach { screen ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (currentRoute != screen.route) {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = screen.icon,
                                    contentDescription = screen.title
                                )
                            },
                            label = { Text(screen.title) },
                            modifier = Modifier.testTag("nav_item_${screen.route}")
                        )
                    }
                }
            }
        },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = viewModel,
                    onNavigateTo = { route -> navController.navigate(route) }
                )
            }
            composable(Screen.Farms.route) {
                FarmsScreen(
                    viewModel = viewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Parcels.route) {
                ParcelsScreen(viewModel = viewModel)
            }
            composable(Screen.Crops.route) {
                CropsScreen(viewModel = viewModel)
            }
            composable(Screen.Activities.route) {
                ActivitiesScreen(
                    viewModel = viewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Finances.route) {
                FinancesScreen(
                    viewModel = viewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
            composable(Screen.Livestock.route) {
                LivestockScreen(viewModel = viewModel)
            }
            composable(Screen.Calculator.route) {
                CalculatorScreen()
            }
        }
    }
}
