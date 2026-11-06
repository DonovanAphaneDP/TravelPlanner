<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/data/trips.json';

function loadTrips($file) {
    if (!file_exists($file)) {
        return [];
    }
    $json = file_get_contents($file);
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function saveTrips($file, $trips) {
    $dir = dirname($file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return file_put_contents($file, json_encode($trips, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function generateId() {
    return 'trip_' . bin2hex(random_bytes(4));
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_trips':
            $trips = loadTrips($dataFile);
            echo json_encode(['success' => true, 'trips' => $trips]);
            break;

        case 'add_trip':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['title']) || empty($input['destination'])) {
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                break;
            }

            $trips = loadTrips($dataFile);
            $newTrip = [
                'id' => generateId(),
                'title' => trim($input['title']),
                'destination' => trim($input['destination']),
                'startDate' => $input['startDate'] ?? '',
                'endDate' => $input['endDate'] ?? '',
                'budget' => floatval($input['budget'] ?? 0),
                'spent' => floatval($input['spent'] ?? 0),
                'status' => $input['status'] ?? 'upcoming',
                'image' => $input['image'] ?? 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
                'notes' => $input['notes'] ?? '',
                'itinerary' => $input['itinerary'] ?? [],
                'packing' => $input['packing'] ?? [
                    ['item' => 'Passport', 'packed' => false],
                    ['item' => 'Phone charger', 'packed' => false],
                    ['item' => 'Toiletries', 'packed' => false]
                ]
            ];

            $trips[] = $newTrip;
            if (saveTrips($dataFile, $trips)) {
                echo json_encode(['success' => true, 'trip' => $newTrip]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to save']);
            }
            break;

        case 'update_trip':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'Missing trip ID']);
                break;
            }

            $trips = loadTrips($dataFile);
            $found = false;
            foreach ($trips as &$trip) {
                if ($trip['id'] === $input['id']) {
                    $trip['title'] = trim($input['title'] ?? $trip['title']);
                    $trip['destination'] = trim($input['destination'] ?? $trip['destination']);
                    $trip['startDate'] = $input['startDate'] ?? $trip['startDate'];
                    $trip['endDate'] = $input['endDate'] ?? $trip['endDate'];
                    $trip['budget'] = floatval($input['budget'] ?? $trip['budget']);
                    $trip['spent'] = floatval($input['spent'] ?? $trip['spent']);
                    $trip['status'] = $input['status'] ?? $trip['status'];
                    $trip['notes'] = $input['notes'] ?? $trip['notes'];
                    if (!empty($input['image'])) {
                        $trip['image'] = $input['image'];
                    }
                    $found = true;
                    break;
                }
            }
            unset($trip);

            if ($found && saveTrips($dataFile, $trips)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => $found ? 'Failed to save' : 'Trip not found']);
            }
            break;

        case 'delete_trip':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'Missing trip ID']);
                break;
            }

            $trips = loadTrips($dataFile);
            $originalCount = count($trips);
            $trips = array_values(array_filter($trips, fn($t) => $t['id'] !== $input['id']));

            if (count($trips) < $originalCount && saveTrips($dataFile, $trips)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Trip not found or save failed']);
            }
            break;

        case 'toggle_packing':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['id']) || !isset($input['index'])) {
                echo json_encode(['success' => false, 'message' => 'Missing data']);
                break;
            }

            $trips = loadTrips($dataFile);
            $found = false;
            foreach ($trips as &$trip) {
                if ($trip['id'] === $input['id'] && isset($trip['packing'][$input['index']])) {
                    $trip['packing'][$input['index']]['packed'] = (bool)$input['packed'];
                    $found = true;
                    break;
                }
            }
            unset($trip);

            if ($found && saveTrips($dataFile, $trips)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Update failed']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Unknown action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
