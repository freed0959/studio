import { createClient } from '@/lib/supabase/client';
import { MasterExpense, Platform } from '@/lib/types';

const MASTER_KEY = 'rutin-tracker-master';
const PLATFORMS_KEY = 'rutin-tracker-platforms';
const MONTHLY_KEY_PREFIX = 'rutin-tracker-monthly-';

export async function migrateLocalStorageToSupabase(): Promise<{
  expensesMigrated: number;
  platformsMigrated: number;
  error?: string;
}> {
  const supabase = createClient();

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { expensesMigrated: 0, platformsMigrated: 0, error: 'User not authenticated' };
    }

    let expensesMigrated = 0;
    let platformsMigrated = 0;

    // Migrate master expenses
    try {
      const storedMaster = localStorage.getItem(MASTER_KEY);
      if (storedMaster) {
        const expenses: MasterExpense[] = JSON.parse(storedMaster);
        
        for (const expense of expenses) {
          const { error } = await supabase
            .from('master_expenses')
            .upsert({
              id: expense.id,
              user_id: user.id,
              name: expense.name,
              amount: expense.amount,
              platform: expense.platform,
              due_date: expense.dueDate,
              recurrence: expense.recurrence,
            });

          if (!error) {
            expensesMigrated++;
          }
        }
      }
    } catch (error) {
      console.error('Error migrating expenses:', error);
    }

    // Migrate platforms
    try {
      const storedPlatforms = localStorage.getItem(PLATFORMS_KEY);
      if (storedPlatforms) {
        const platforms: Platform[] = JSON.parse(storedPlatforms);
        
        for (const platform of platforms) {
          const { error } = await supabase
            .from('platforms')
            .upsert({
              id: platform.id,
              user_id: user.id,
              name: platform.name,
            });

          if (!error) {
            platformsMigrated++;
          }
        }
      }
    } catch (error) {
      console.error('Error migrating platforms:', error);
    }

    // Migrate monthly data
    try {
      // Get all month keys from localStorage
      const keys = Object.keys(localStorage).filter(key => key.startsWith(MONTHLY_KEY_PREFIX));
      
      for (const key of keys) {
        const month = key.replace(MONTHLY_KEY_PREFIX, '');
        const storedMonthly = localStorage.getItem(key);
        
        if (storedMonthly) {
          const monthlyData = JSON.parse(storedMonthly);
          
          const { error } = await supabase
            .from('monthly_expense_states')
            .upsert({
              user_id: user.id,
              month: month,
              expense_states: monthlyData.expenses,
            });

          if (error) {
            console.error(`Error migrating monthly data for ${month}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error migrating monthly data:', error);
    }

    return { expensesMigrated, platformsMigrated };
  } catch (error) {
    console.error('Migration error:', error);
    return { 
      expensesMigrated: 0, 
      platformsMigrated: 0, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export function hasLocalStorageData(): boolean {
  try {
    const hasMaster = localStorage.getItem(MASTER_KEY) !== null;
    const hasPlatforms = localStorage.getItem(PLATFORMS_KEY) !== null;
    return hasMaster || hasPlatforms;
  } catch {
    return false;
  }
}
