import  type{ Interaction } from '../types/user';



/**
 * Format interaction data for display
 */
export const formatInteractionDescription = (interaction: Interaction): string => {
  const element = interaction.actionElement;
  
  switch (interaction.actionType) {
    case 'click':
      if (element === 'pdf') {
        return `Downloaded PDF`;
      } else if (element === 'link') {
        return `Clicked on link`;
      } else if (element === 'button') {
        return `Clicked button`;
      } else {
        return `Clicked on ${element}`;
      }
    
    case 'view':
      if (element.startsWith('booth')) {
        return `Viewed booth`;
      } else if (element === 'product') {
        return `Viewed product details`;
      } else {
        return `Viewed ${element}`;
      }
    
    case 'watch':
      return `Watched video`;
      
    case 'download':
      return `Downloaded ${element}`;
      
    case 'login':
      return 'Logged in';
      
    case 'logout':
      return 'Logged out';
      
    default:
      return `${interaction.actionType} ${element}`;
  }
};

/**
 * Get the details or badge for an interaction
 */
export const getInteractionDetails = (interaction: Interaction): {
  text: string;
  badgeType?: 'success' | 'info' | 'warning' | 'error';
} => {
  if (interaction.actionSubType) {
    return {
      text: interaction.actionSubType,
      badgeType: 'info'
    };
  }
  
  if (interaction.actionType === 'watch') {
    return {
      text: '100% Watched',
      badgeType: 'success'
    };
  }
  
  if (interaction.actionType === 'download' || 
      (interaction.actionType === 'click' && interaction.actionElement === 'pdf')) {
    return {
      text: 'Downloaded',
      badgeType: 'info'
    };
  }
  
  if (interaction.actionType === 'login') {
    return {
      text: 'Successful',
      badgeType: 'success'
    };
  }
  
  return {
    text: '-'
  };
};