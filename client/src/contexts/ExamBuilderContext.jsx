import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateStableId, serverToUI, uiToServer, validateExamForSubmit } from '../utils/examNormalization';

// ─── Create default choices for MCQ (min 2) ───────────────────────
const createDefaultChoices = (count = 2) =>
  Array.from({ length: count }, (_, i) => ({
    id: generateStableId('opt'),
    text: '',
    isCorrect: i === 0
  }));

// ─── Context ─────────────────────────────────────────────────────
const ExamBuilderContext = createContext(null);

export const useExamBuilder = () => {
  const ctx = useContext(ExamBuilderContext);
  if (!ctx) throw new Error('useExamBuilder must be used within ExamBuilderProvider');
  return ctx;
};

export const ExamBuilderProvider = ({
  initialExam = { title: '', questions: [] },
  children
}) => {
  // Initialize using shared serverToUI normalization
  const [examForm, setExamForm] = useState(() => {
    const uiData = serverToUI(initialExam);
    // Ensure every MCQ question has at least 2 choices
    uiData.questions = uiData.questions.map(q => {
      if (q.type === 'mcq' && (!q.choices || q.choices.length < 2)) {
        return { ...q, choices: createDefaultChoices(2) };
      }
      return q;
    });
    return uiData;
  });

  const updateQuestion = useCallback((questionId, field, value) => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const updated = { ...q, [field]: value };
        if (field === 'type' && value === 'mcq' && (!updated.choices || updated.choices.length === 0)) {
          updated.choices = createDefaultChoices(2);
        }
        return updated;
      })
    }));
  }, []);

  const addQuestion = useCallback((type = 'mcq', insertAfterId = null) => {
    const newQuestion = {
      id: generateStableId('q'),
      type,
      questionText: '',
      choices: type === 'mcq' ? createDefaultChoices(2) : [],
      correctAnswer: type === 'true_false' ? true : null,
      marks: 10,
      order: 0
    };

    let newId;
    setExamForm(prev => {
      const insertIndex =
        insertAfterId != null
          ? prev.questions.findIndex(q => q.id === insertAfterId) + 1
          : prev.questions.length;
      const reordered = prev.questions.map((q, i) => ({
        ...q,
        order: i >= insertIndex ? i + 2 : i + 1
      }));
      newQuestion.order = insertIndex + 1;
      const questions = [
        ...reordered.slice(0, insertIndex),
        newQuestion,
        ...reordered.slice(insertIndex)
      ].map((q, i) => ({ ...q, order: i + 1 }));
      newId = newQuestion.id;
      return { ...prev, questions };
    });
    return newId;
  }, []);

  const removeQuestion = useCallback(questionId => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.id !== questionId)
        .map((q, i) => ({ ...q, order: i + 1 }))
    }));
  }, []);

  const duplicateQuestion = useCallback(questionId => {
    let duplicatedId = null;
    setExamForm(prev => {
      const question = prev.questions.find(q => q.id === questionId);
      if (!question) return prev;
      const duplicated = {
        ...question,
        id: generateStableId('q'),
        questionText: question.questionText ? `${question.questionText} (نسخة)` : '',
        choices:
          question.choices?.map(c => ({
            ...c,
            id: generateStableId('opt'),
            isCorrect: c.isCorrect
          })) ?? [],
        order: prev.questions.length + 1
      };
      duplicatedId = duplicated.id;
      return {
        ...prev,
        questions: [...prev.questions, duplicated]
      };
    });
    return duplicatedId;
  }, []);

  const addChoice = useCallback(questionId => {
    setExamForm(prev => {
      const question = prev.questions.find(q => q.id === questionId);
      if (!question || question.type !== 'mcq') return prev;
      const newChoice = {
        id: generateStableId('opt'),
        text: '',
        isCorrect: (question.choices?.length ?? 0) === 0
      };
      return {
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, choices: [...(q.choices ?? []), newChoice] } : q
        )
      };
    });
  }, []);

  const removeChoice = useCallback((questionId, choiceId) => {
    setExamForm(prev => {
      const question = prev.questions.find(q => q.id === questionId);
      if (!question?.choices || question.choices.length <= 2) return prev;
      const removed = question.choices.find(c => c.id === choiceId);
      const newChoices = question.choices.filter(c => c.id !== choiceId);
      let finalChoices = newChoices;
      if (removed?.isCorrect && newChoices.length > 0 && !newChoices.some(c => c.isCorrect)) {
        finalChoices = newChoices.map((c, i) => ({ ...c, isCorrect: i === 0 }));
      }
      return {
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, choices: finalChoices } : q
        )
      };
    });
  }, []);

  // Single-choice only: Radio behavior -- selecting one unselects others
// Mark a choice as correct (for MCQ)
// Mark a choice as correct (for MCQ)
const setCorrectAnswer = useCallback((qId, choiceId) => {
  setExamForm(prev => ({
    ...prev,
    questions: prev.questions.map(q => {
      if (q.id !== qId) return q;
      
      // ✅ CRITICAL FIX: Update isCorrect flag on ALL choices
      return {
        ...q,
        choices: (q.choices || []).map(c => ({
          ...c,
          isCorrect: c.id === choiceId  // ← Only the selected choice gets true
        }))
      };
    })
  }));
}, []);

  const updateChoice = useCallback((questionId, choiceId, field, value) => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId || !q.choices) return q;
        return {
          ...q,
          choices: q.choices.map(c =>
            c.id === choiceId ? { ...c, [field]: value } : c
          )
        };
      })
    }));
  }, []);

  const setTitle = useCallback(title => {
    setExamForm(prev => ({ ...prev, title }));
  }, []);

  const resetForm = useCallback(newInitial => {
    const uiData = serverToUI(newInitial ?? initialExam);
    uiData.questions = uiData.questions.map(q => {
      if (q.type === 'mcq' && (!q.choices || q.choices.length < 2)) {
        return { ...q, choices: createDefaultChoices(2) };
      }
      return q;
    });
    setExamForm(uiData);
  }, [initialExam]);

  // Export exam data in server format (for saving)
  const getExamForServer = useCallback((existingExamId = null) => {
    return uiToServer(examForm, existingExamId);
  }, [examForm]);

  // Validate current exam form
  const validate = useCallback(() => {
    return validateExamForSubmit(examForm);
  }, [examForm]);

  const value = {
    examForm,
    setTitle,
    addQuestion,
    removeQuestion,
    updateQuestion,
    duplicateQuestion,
    addChoice,
    removeChoice,
    updateChoice,
    setCorrectAnswer,
    resetForm,
    getExamForServer,
    validate
  };

  return (
    <ExamBuilderContext.Provider value={value}>
      {children}
    </ExamBuilderContext.Provider>
  );
};

export default ExamBuilderContext;
