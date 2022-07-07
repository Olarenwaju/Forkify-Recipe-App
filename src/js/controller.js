import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js'; 
import resultsView from './views/resultsView.js'; 
import paginationView from './views/paginationView.js'; 
import bookmarksView from './views/bookmarksView.js';  
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

if(module.hot) {
  module.hot.accept();
}

const controlRecipes = async function() {
  try{
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Results View To Mark Selected Search results
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating Bookmark View
    bookmarksView.update(model.state.bookmarks);

    
    // 2) Loading Recipe
    await model.loadRecipe(id);
    //const {recipe} = model.state.recipe

    // 3) Rendering Recipe
    recipeView.render(model.state.recipe);

  } catch (err) {
    recipeView.renderError(); 
    console.error(err);
  }
};

const controlSearchResults = async function() {

  try {   
    resultsView.renderSpinner();
    
    // 1) Get Search Query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render Initail pagination buttons
    paginationView.render(model.state.search);

  } catch(err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  // 1) Render New results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 4) Rende New Initail pagination buttons
    paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
  // Update the Recipe serving (in state)
  model.updateServings(newServings);

  // Update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {
  // 1) Add or Remove bookmark
  if(!model.state.recipe.bookmarked)
         model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //  2) Update Recipe View
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
};

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show Loading Spinner
    addRecipeView.renderSpinner();

    // Upload New Recipe Data 
   await  model.uploadRecipe(newRecipe);
   console.log(model.state.recipe);

   //Render Recipe
   recipeView.render(model.state.recipe);

   //Success Message
   // An error here that needs to be fixed...
   //addRecipeView.renderMessage();

   // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // chnage ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //window.history.back()

   // Close Form Window
   setTimeout(function() {
    addRecipeView.toggleWindow()
   }, MODAL_CLOSE_SEC * 1000)

  } catch(err) {
    console.error('********', err);
    addRecipeView.renderError(err.message);
  }

  setTimeout(function () {
    location.reload();
  }, 1500);
}

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks );
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addhandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

const clearBookmarks = function() {
  localStorage.clear('bookmarks');
};
//clearBookmarks();