from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from .models import Conversation, ConversationMessage
from poultryitems.models import Item
from .forms import ConversationMessageForm
from django.core.cache import cache
from django.http import JsonResponse
from asgiref.sync import sync_to_async
from django.views.decorators.cache import never_cache

@login_required
@never_cache 
def unread_count_api(request):
    conversations = Conversation.objects.filter(members=request.user)
    unread_counts = {
        str(conv.id): ConversationMessage.objects.filter(
            conversation=conv,
            is_read=False
        ).exclude(created_by=request.user).count()
        for conv in conversations
    }
    return JsonResponse({
        'total_unread': sum(unread_counts.values()),
        'by_conversation': unread_counts 
    })

@login_required(login_url='login')
def inbox(request):
    conversations = Conversation.objects.filter(
        members=request.user
    ).prefetch_related('members', 'item', 'messages')
    
    unread_counts = {}
    for conv in conversations:
        cache_key = f"unread_{request.user.id}_{conv.id}"
        unread = cache.get(cache_key)
        
        if unread is None:
            unread = ConversationMessage.objects.filter(
                conversation=conv,
                is_read=False
            ).exclude(created_by=request.user).count()
            cache.set(cache_key, unread, timeout=300)
        
        unread_counts[str(conv.id)] = unread
    
    return render(request, 'conversation/inbox.html', {
        'conversations': conversations,
        'unread_counts': unread_counts,
    })

def new_conversation(request, item_pk):
    item = get_object_or_404(Item, pk=item_pk)
    
    if item.created_by == request.user:
        return redirect('dashboard:index')
    
    conversation = Conversation.objects.filter(
        item=item,
        members=request.user
    ).first()
    
    if conversation:
        return redirect('conversation:detail', pk=conversation.id)

    if request.method == 'POST':
        form = ConversationMessageForm(request.POST)
        if form.is_valid():
            conversation = Conversation.objects.create(item=item)
            conversation.members.add(request.user, item.created_by)
            
            conversation_message = form.save(commit=False)
            conversation_message.conversation = conversation
            conversation_message.created_by = request.user
            conversation_message.save()
            
            return redirect('conversation:detail', pk=conversation.id)
    else:
        form = ConversationMessageForm()

    return render(request, 'conversation/new.html', {
        'form': form,
        'item': item
    })

def detail(request, pk):
    conversation = get_object_or_404(
        Conversation.objects.filter(members=request.user),
        pk=pk
    )
    
    ConversationMessage.objects.filter(
        conversation=conversation,
        is_read=False
    ).exclude(created_by=request.user).update(is_read=True)

    if request.method == 'POST':
        form = ConversationMessageForm(request.POST)
        if form.is_valid():
            conversation_message = form.save(commit=False)
            conversation_message.conversation = conversation
            conversation_message.created_by = request.user
            conversation_message.save()
            
            conversation.save() 
            return redirect('conversation:detail', pk=pk)
    else:
        form = ConversationMessageForm()

    return render(request, 'conversation/detail.html', {
        'conversation': conversation,
        'form': form
    })

@login_required
def mark_all_read(request):
    if request.method == 'POST':
        # Implementation here
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)
def get_unread_count(user, conversation):
    return ConversationMessage.objects.filter(
        conversation=conversation,
        is_read=False
    ).exclude(created_by=user).count()
