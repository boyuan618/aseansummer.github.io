import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Map, Users, Trophy, Compass, Clock, MapPin, Calendar, Anchor, Star, Waves, Crown } from 'lucide-react';
import { supabase } from '../supabase';
import basemap from '../assets/Without the halls.png';





interface Activity {
  id: string;
  theme: string;
  description: string;
  location: string;
  order: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  activities: { [key: number]: number[] }; // activity number -> group numbers
}

interface CompletionData {
  [groupId: string]: {
    [activityId: string]: boolean;
  };
}

const activities: Activity[] = [
  {
    id: 'mermaids-lagoon',
    theme: "Mermaid's Lagoon",
    description: "Dive into the mystical waters where mermaids once sang their enchanting songs. Decipher the ancient rebus puzzles left by the sea maidens to unlock the secrets hidden beneath the waves. Only those who can read the symbolic language of the deep will discover the treasure.",
    location: "Arc",
    order: 1
  },
  {
    id: 'krakens-wrath',
    theme: "Kraken's Wrath",
    description: "Face the legendary sea monster in this thrilling Ddjaki challenge. Test your courage and precision as you battle against the mighty tentacles of the deep. Master the ancient throwing technique to defeat the kraken and claim victory over the seas.",
    location: "LWN",
    order: 2
  },
  {
    id: 'cursed-compass',
    theme: "Cursed Compass",
    description: "Follow the cursed compass through the explosive Splat! challenge. Navigate through twisted paths where one wrong move could spell disaster. Only pirates with quick reflexes and steady nerves can break the ancient curse and find the hidden treasure.",
    location: "AIA",
    order: 3
  },
  {
    id: 'plank-duel',
    theme: "Plank Duel",
    description: "Walk the plank in this nerve-wracking Eraser Game challenge. Test your steady hand and unwavering focus as you balance on the edge of defeat. One false move and you'll be swimming with the fishes - only the most precise pirates survive this deadly duel.",
    location: "Audi",
    order: 4
  },
  {
    id: 'isle-of-echoes',
    theme: "Isle of Echoes",
    description: "On this mysterious island, every melody holds a secret message. Listen carefully to the songs of old pirates in this musical challenge. Use your keen ear and knowledge of sea shanties to identify the tunes that will guide you to the legendary treasure.",
    location: "Hive",
    order: 5
  },
  {
    id: 'cannonball-clash',
    theme: "Cannonball Clash",
    description: "Load the cannons and prepare for the Frog Game battle! This high-energy challenge tests your aim and timing as you launch attacks against rival crews. Master the art of precision warfare to dominate the seas in this epic pirate showdown.",
    location: "GAIA",
    order: 6
  },
  {
    id: 'tropical-trickery',
    theme: "Tropical Trickery",
    description: "Navigate through a maze of tropical traps and tricky Yes or No decisions. What seems obvious may be a trap, and what appears impossible might be your salvation. Trust your instincts and choose wisely in this mind-bending pirate puzzle.",
    location: "HSS",
    order: 7
  },
  {
    id: 'blazing-buccaneers',
    theme: "Blazing Buccaneers",
    description: "The final challenge where legends are born! Master the ancient art of Chapteh in this blazing finale. Show off your footwork and coordination skills as you compete for the ultimate pirate glory. Only true buccaneers can conquer this legendary test.",
    location: "CHC",
    order: 8
  }
];

const timeSlots: TimeSlot[] = [
  {
    startTime: "8:45",
    endTime: "9:05",
    activities: {
      1: [1, 2], 2: [3, 4], 3: [5, 6], 4: [7, 8], 5: [9, 10], 6: [11, 12], 7: [13, 14], 8: [15, 16]
    }
  },
  {
    startTime: "9:05",
    endTime: "9:25",
    activities: {
      1: [3, 5], 2: [1, 6], 3: [7, 2], 4: [9, 4], 5: [11, 8], 6: [13, 15], 7: [10, 16], 8: [14, 12]
    }
  },
  {
    startTime: "9:25",
    endTime: "9:45",
    activities: {
      1: [8, 4], 2: [10, 2], 3: [12, 1], 4: [5, 11], 5: [13, 16], 6: [3, 14], 7: [6, 15], 8: [7, 9]
    }
  },
  {
    startTime: "9:45",
    endTime: "10:05",
    activities: {
      1: [13, 6], 2: [11, 14], 3: [4, 16], 4: [1, 10], 5: [7, 15], 6: [2, 9], 7: [3, 12], 8: [8, 5]
    }
  },
  {
    startTime: "10:05",
    endTime: "10:25",
    activities: {
      1: [7, 16], 2: [15, 5], 3: [14, 9], 4: [6, 12], 5: [2, 3], 6: [1, 8], 7: [4, 11], 8: [10, 13]
    }
  },
  {
    startTime: "10:25",
    endTime: "10:45",
    activities: {
      1: [14, 10], 2: [7, 12], 3: [8, 15], 4: [2, 13], 5: [6, 4], 6: [5, 16], 7: [1, 9], 8: [3, 11]
    }
  },
  {
    startTime: "10:45",
    endTime: "11:05",
    activities: {
      1: [11, 15], 2: [13, 9], 3: [10, 3], 4: [14, 16], 5: [12, 5], 6: [6, 7], 7: [2, 8], 8: [4, 1]
    }
  },
  {
    startTime: "11:05",
    endTime: "11:25",
    activities: {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] // Free for all
    }
  }
];

// Map location coordinates for overlays (percentage-based positioning)
const mapLocations = {
  'Arc': { x: 61.5, y: 28, width: 16, height: 15 }, // The Arc
  'LWN': { x: 23, y: 33, width: 15, height: 15 }, // Lee Wee Nam Library
  'AIA': { x: 34.5, y: 25, width: 12, height: 12 }, // ADM area
  'Audi': { x: 20, y: 45.7, width: 15, height: 15 }, // Nanyang Audi
  'Hive': { x: 41, y: 46, width: 15, height: 15 }, // The Hive
  'GAIA': { x: 36, y: 57, width: 18, height: 18 }, // GAIA
  'HSS': { x: 57.5, y: 43, width: 14, height: 14 }, // Chinese Heritage Centre area
  'CHC': { x: 55, y: 53, width: 21, height: 21 } // Chinese Heritage Centre
};

interface GroupActivity {
  activity: Activity;
  timeSlot: string;
  isActive: boolean;
  isCompleted: boolean;
}

function Landing() {
  const { user, logout } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<GroupActivity | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completionData, setCompletionData] = useState<CompletionData>({});
  const [loading, setLoading] = useState<boolean>(true);

  const userGroup = Number(user?.group) || 1;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // TODO: Replace with actual Supabase fetch
  useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Assuming your table is called 'groups' with columns 'group_id' and 'completed_activities' (JSON array)
          const { data, error } = await supabase
            .from('groups')
            .select('*');
  
          if (error) throw error;
  
          // Build initial completionData object
          const initialData: CompletionData = {};
  
          // Initialize all groups with false for all activities by default
          for (let i = 1; i <= 16; i++) {
            initialData[i.toString()] = {};
            activities.forEach(activity => {
              initialData[i.toString()][activity.id] = false;
            });
          }
  
          // Overwrite with DB values if available
          data?.forEach((row: any) => {
            const groupId = row.group_id.toString();
            if (typeof row.tasks_complete === 'string') {
                const completedIds = row.tasks_complete.split(',');
                completedIds.forEach((activityId: string) => {
                  if (initialData[groupId]) {
                    initialData[groupId][activityId] = true;
                  }
                });
              }
              
          });
  
          setCompletionData(initialData);
        } catch (error) {
          console.error('Error fetching completion data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  const silhouetteImages = import.meta.glob('../assets/*.png', {
    eager: true,
    import: 'default'
  }) as Record<string, string>;


  const getSilhouetteImage = (location: string) => {
    const sanitized = location.replace(/\s+/g, '%20'); // if filenames have spaces encoded
    return silhouetteImages[`../assets/${sanitized}.png`];
  };

  // Convert time string to minutes for proper sorting and comparison
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if an activity is currently active
  const isActivityActive = (timeSlot: string): boolean => {
    const [startTime, endTime] = timeSlot.split(' - ');
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  // Check if activity is completed from Supabase data
  const isActivityCompleted = (activityId: string): boolean => {
    return completionData[userGroup.toString()]?.[activityId] || false;
  };

  // Get activities for the user's group
  const getGroupActivities = (): GroupActivity[] => {
    const groupActivities: GroupActivity[] = [];
    
    timeSlots.forEach((slot, slotIndex) => {
      // Skip the free-for-all slot for individual activities
      if (slotIndex === 7) {
        const activityKey = 'free-for-all';
        groupActivities.push({
          activity: {
            id: 'free-for-all',
            theme: 'Free for All',
            description: 'All groups participate together in the final celebration and prize distribution ceremony. Gather at the main assembly area for the grand finale of your pirate adventure! Celebrate your victories and claim your treasures!',
            location: '-',
            order: 9
          },
          timeSlot: `${slot.startTime} - ${slot.endTime}`,
          isActive: isActivityActive(`${slot.startTime} - ${slot.endTime}`),
          isCompleted: isActivityCompleted(activityKey)
        });
        return;
      }

      // Find which activity this group is doing in this time slot
      Object.entries(slot.activities).forEach(([activityNum, groups]) => {
        if (groups.includes(userGroup)) {
          const activity = activities[parseInt(activityNum) - 1];
          groupActivities.push({
            activity,
            timeSlot: `${slot.startTime} - ${slot.endTime}`,
            isActive: isActivityActive(`${slot.startTime} - ${slot.endTime}`),
            isCompleted: isActivityCompleted(activity.id)
          });
        }
      });
    });

    // Sort by time slot using proper time comparison
    return groupActivities.sort((a, b) => {
      const timeA = timeToMinutes(a.timeSlot.split(' - ')[0]);
      const timeB = timeToMinutes(b.timeSlot.split(' - ')[0]);
      return timeA - timeB;
    });
  };

  const groupActivities = getGroupActivities();

  React.useEffect(() => {
    if (groupActivities.length > 0 && !selectedActivity) {
      // Select the currently active activity or the first upcoming one
      const activeActivity = groupActivities.find(ga => ga.isActive);
      const nextActivity = groupActivities.find(ga => !ga.isCompleted && !ga.isActive);
      setSelectedActivity(activeActivity || nextActivity || groupActivities[0]);
    }
  }, [groupActivities.length, currentTime]);

  const handleLogout = () => {
    logout();
  };

  // Check if a location should be covered (activity not completed)
  const isLocationCovered = (location: string): boolean => {
    const locationActivities = groupActivities.filter(ga => ga.activity.location === location);
    return locationActivities.some(ga => !ga.isCompleted);
  };


  if (loading) {
    return <div className="text-yellow-400 font-bold p-8">Loading...</div>;
  }  

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background waves */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-20 animate-pulse">
          <Map size={150} className="text-yellow-400 transform rotate-12" />
        </div>
        <div className="absolute bottom-20 right-32 animate-bounce">
          <Compass size={120} className="text-blue-300 transform -rotate-12" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-spin" style={{ animationDuration: '30s' }}>
          <Anchor size={100} className="text-yellow-600/30" />
        </div>
      </div>

      {/* Floating treasure sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="w-full bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-yellow-400/20 shadow-2xl z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-3 sm:py-0">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-200">
                <Compass size={24} className="text-slate-900 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400 font-serif">Pirate's Quest</h1>
                <p className="text-sm text-blue-200">Amazing Race Adventure</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-right space-y-2 sm:space-y-0">
              <div>
                <p className="text-yellow-400 font-medium flex items-center justify-end sm:justify-start">
                  <Crown size={16} className="mr-1" />
                  {user?.name}
                </p>
                <p className="text-sm text-blue-300">{user?.programme} • Group {user?.group}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-400/50 transform hover:scale-105"
              >
                <LogOut size={16} />
                <span>Abandon Ship</span>
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left panel - Group Schedule */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-6 relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-yellow-400/30 rounded-br-2xl"></div>

              <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-serif flex items-center">
                <Calendar className="mr-3" size={24} />
                Group {user?.group} Schedule
              </h2>


              {/* Activity Schedule Cards */}
              <div className="space-y-3 mb-6">
                {groupActivities.map((groupActivity, index) => (
                  <button
                    key={`${groupActivity.activity.id}-${index}`}
                    onClick={() => setSelectedActivity(groupActivity)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 border transform hover:scale-[1.02] ${
                      selectedActivity?.activity.id === groupActivity.activity.id && 
                      selectedActivity?.timeSlot === groupActivity.timeSlot
                        ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400 shadow-lg'
                        : groupActivity.isActive
                        ? 'bg-green-400/20 border-green-400/50 text-green-400 animate-pulse'
                        : groupActivity.isCompleted
                        ? 'bg-blue-400/20 border-blue-400/50 text-blue-400'
                        : 'bg-slate-700/30 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm">{groupActivity.activity.theme}</h3>
                      <div className="flex items-center space-x-2">
                        {groupActivity.isCompleted && (
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          </div>
                        )}
                        {groupActivity.isActive && (
                          <div className="flex items-center space-x-1">
                            <Waves size={12} className="text-green-400" />
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-xs opacity-75">
                      <Clock size={12} className="mr-1" />
                      {groupActivity.timeSlot}
                    </div>
                    <div className="flex items-center text-xs opacity-75 mt-1">
                      <MapPin size={12} className="mr-1" />
                      {groupActivity.activity.location}
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/40 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Trophy className="text-yellow-400" size={20} />
                      <span className="text-blue-200">Treasure Chests Found</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-lg">
                      {groupActivities.filter(ga => ga.isCompleted).length}/{groupActivities.length}
                    </span>
                  </div>
                  <div className="mt-2 bg-slate-600/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(groupActivities.filter(ga => ga.isCompleted).length / groupActivities.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/40 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="text-blue-400" size={20} />
                      <span className="text-blue-200">Pirate Crew</span>
                    </div>
                    <span className="text-blue-400 font-bold text-lg">#{user?.group}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Activity Details */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-8 h-full relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-yellow-400/30 rounded-br-2xl"></div>

              {selectedActivity && (
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-4xl font-bold text-yellow-400 font-serif">
                      {selectedActivity.activity.theme}
                    </h2>
                    <div className="flex items-center space-x-3">
                      {selectedActivity.isCompleted && (
                        <div className="bg-blue-400/20 px-4 py-2 rounded-full border border-blue-400/50">
                          <span className="text-blue-400 font-medium text-sm flex items-center">
                            <Star size={16} className="mr-2 fill-current" />
                            Treasure Found
                          </span>
                        </div>
                      )}
                      <div className="bg-yellow-400/20 px-4 py-2 rounded-full border border-yellow-400/50">
                        <span className="text-yellow-400 font-medium text-sm">
                          {selectedActivity.activity.order === 9 ? 'Final Event' : `Station ${selectedActivity.activity.order}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-blue-200 mb-8 text-lg leading-relaxed">
                    {selectedActivity.activity.description}
                  </p>

                  {/* Activity Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center space-x-3 mb-3">
                        <MapPin className="text-yellow-400" size={24} />
                        <span className="text-yellow-400 font-medium text-lg">Location</span>
                      </div>
                      <p className="text-blue-200 text-lg">{selectedActivity.activity.location}</p>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center space-x-3 mb-3">
                        <Clock className="text-blue-400" size={24} />
                        <span className="text-blue-400 font-medium text-lg">Your Time Slot</span>
                      </div>
                      <p className="text-blue-200 text-lg">{selectedActivity.timeSlot}</p>
                    </div>
                  </div>

                  {/* Interactive Treasure Map */}
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl border-4 border-amber-800/50 shadow-2xl relative overflow-hidden">
                    <div className="relative w-full">
                      {/* Base map image */}

                      <img src={basemap}
                        alt="NTU Treasure Map" 
                        className="w-full h-128 object-cover"

                      />
                      
                      {/* Location overlays with silhouettes for uncompleted activities */}
                      {Object.entries(mapLocations).map(([location, coords]) => {
                          const isCovered = isLocationCovered(location);
                          const isCurrentLocation = selectedActivity?.activity.location === location;

                          return (
                           <div
                              key={location}
                              className={`absolute transition-all duration-500 rounded-lg
                              } ${isCurrentLocation ? 'z-20' : 'z-10'}`}

                              style={{
                                left: `${coords.x}%`,
                                top: `${coords.y}%`,
                                width: `${coords.width}%`,
                                height: `${coords.height}%`,
                              }}
                            >
                            {isCovered && (
                              <img
                                src={getSilhouetteImage(location)}
                                alt={`${location} covered`}
                                className="absolute inset-0 w-full h-full object-contain"
                              />
                            )}

                          </div>
                        );
                      })}
                    </div>

                  
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;